import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc/trpc";
import { prisma, Prisma } from "@hyble/db";

// Helper: Kullanıcının aktif sepetini getir veya oluştur
async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      items: true,
      coupon: true,
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        status: "ACTIVE",
        currency: "EUR",
      },
      include: {
        items: true,
        coupon: true,
      },
    });
  }

  return cart;
}

// Helper: Sepet toplamlarını hesapla
async function calculateCartTotals(cartId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: true,
      coupon: true,
    },
  });

  if (!cart) return null;

  // Subtotal: Tüm ürünlerin toplamı
  const subtotal = cart.items.reduce((sum, item) => {
    return sum.add(item.unitPrice.mul(item.quantity));
  }, new Prisma.Decimal(0));

  // Discount hesapla
  let discountAmount = new Prisma.Decimal(0);
  if (cart.coupon && cart.coupon.status === "ACTIVE") {
    if (cart.coupon.type === "PERCENTAGE") {
      discountAmount = subtotal.mul(cart.coupon.value).div(100);
      // Max discount kontrolü
      if (cart.coupon.maxDiscount && discountAmount.greaterThan(cart.coupon.maxDiscount)) {
        discountAmount = cart.coupon.maxDiscount;
      }
    } else if (cart.coupon.type === "FIXED") {
      discountAmount = cart.coupon.value;
      if (discountAmount.greaterThan(subtotal)) {
        discountAmount = subtotal;
      }
    }
  }

  // Tax hesapla (subtotal - discount üzerinden)
  const taxableAmount = subtotal.sub(discountAmount);
  const taxRate = new Prisma.Decimal(20); // %20 KDV
  const taxAmount = taxableAmount.mul(taxRate).div(100);

  // Total
  const total = taxableAmount.add(taxAmount);

  // Güncelle
  await prisma.cart.update({
    where: { id: cartId },
    data: {
      subtotal,
      discountAmount,
      taxAmount,
      total,
    },
  });

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
    taxRate,
  };
}

export const cartRouter = createTRPCRouter({
  // Sepeti getir
  get: protectedProcedure.query(async ({ ctx }) => {
    const cart = await getOrCreateCart(ctx.user.id);
    const totals = await calculateCartTotals(cart.id);

    return {
      id: cart.id,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        productName: item.productName,
        variantName: item.variantName,
        productSlug: item.productSlug,
        total: item.unitPrice.mul(item.quantity).toString(),
      })),
      subtotal: totals?.subtotal.toString() || "0",
      discount: totals?.discountAmount.toString() || "0",
      tax: totals?.taxAmount.toString() || "0",
      taxRate: 20,
      total: totals?.total.toString() || "0",
      currency: cart.currency,
      coupon: cart.coupon
        ? {
            code: cart.couponCode || cart.coupon.code,
            type: cart.coupon.type as "PERCENTAGE" | "FIXED",
            value: cart.coupon.value.toString(),
          }
        : null,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }),

  // Ürün ekle
  addItem: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().min(1).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await getOrCreateCart(ctx.user.id);

      // Ürünü bul
      const product = await prisma.product.findUnique({
        where: { id: input.productId },
        include: {
          variants: input.variantId
            ? { where: { id: input.variantId } }
            : { where: { isDefault: true } },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ürün bulunamadı",
        });
      }

      if (product.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu ürün şu anda satışta değil",
        });
      }

      // Fiyat ve varyant bilgisi
      const variant = product.variants[0];
      const unitPrice = variant?.price || product.basePrice;

      if (!unitPrice) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ürün fiyatı belirlenemedi",
        });
      }

      // Stok kontrolü
      if (variant?.stockType === "LIMITED" && variant.stockQty !== null) {
        const availableStock = variant.stockQty - variant.reservedQty;
        if (availableStock < input.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Yeterli stok yok. Mevcut: ${availableStock}`,
          });
        }
      }

      // Sepette zaten var mı?
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: input.productId,
          variantId: variant?.id || null,
        },
      });

      if (existingItem) {
        // Miktarı artır
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + input.quantity,
          },
        });
      } else {
        // Yeni ürün ekle
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: input.productId,
            variantId: variant?.id || null,
            quantity: input.quantity,
            unitPrice,
            currency: product.currency,
            productName: product.nameTr,
            variantName: variant?.name || null,
            productSlug: product.slug,
          },
        });
      }

      // Stok rezerve et (LIMITED ise)
      if (variant?.stockType === "LIMITED") {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            reservedQty: { increment: input.quantity },
          },
        });
      }

      await calculateCartTotals(cart.id);

      return { success: true };
    }),

  // Ürün çıkar
  removeItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const cart = await getOrCreateCart(ctx.user.id);

      const item = await prisma.cartItem.findFirst({
        where: {
          id: input.itemId,
          cartId: cart.id,
        },
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ürün sepette bulunamadı",
        });
      }

      // Rezervasyonu kaldır
      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (variant?.stockType === "LIMITED") {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              reservedQty: { decrement: item.quantity },
            },
          });
        }
      }

      await prisma.cartItem.delete({
        where: { id: input.itemId },
      });

      await calculateCartTotals(cart.id);

      return { success: true };
    }),

  // Miktar güncelle
  updateQuantity: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        quantity: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await getOrCreateCart(ctx.user.id);

      const item = await prisma.cartItem.findFirst({
        where: {
          id: input.itemId,
          cartId: cart.id,
        },
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ürün sepette bulunamadı",
        });
      }

      // Quantity 0 ise sil
      if (input.quantity === 0) {
        if (item.variantId) {
          const variant = await prisma.productVariant.findUnique({
            where: { id: item.variantId },
          });
          if (variant?.stockType === "LIMITED") {
            await prisma.productVariant.update({
              where: { id: item.variantId },
              data: {
                reservedQty: { decrement: item.quantity },
              },
            });
          }
        }
        await prisma.cartItem.delete({ where: { id: input.itemId } });
      } else {
        // Stok kontrolü
        if (item.variantId) {
          const variant = await prisma.productVariant.findUnique({
            where: { id: item.variantId },
          });
          if (variant?.stockType === "LIMITED" && variant.stockQty !== null) {
            const currentReserved = variant.reservedQty - item.quantity;
            const availableStock = variant.stockQty - currentReserved;
            if (availableStock < input.quantity) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Yeterli stok yok. Mevcut: ${availableStock}`,
              });
            }

            // Rezervasyonu güncelle
            await prisma.productVariant.update({
              where: { id: item.variantId },
              data: {
                reservedQty: currentReserved + input.quantity,
              },
            });
          }
        }

        await prisma.cartItem.update({
          where: { id: input.itemId },
          data: { quantity: input.quantity },
        });
      }

      await calculateCartTotals(cart.id);

      return { success: true };
    }),

  // Sepeti temizle
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const cart = await getOrCreateCart(ctx.user.id);

    // Tüm rezervasyonları kaldır
    for (const item of cart.items) {
      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (variant?.stockType === "LIMITED") {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              reservedQty: { decrement: item.quantity },
            },
          });
        }
      }
    }

    // Tüm ürünleri sil
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Kuponu kaldır
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        couponId: null,
        couponCode: null,
        discountAmount: 0,
        subtotal: 0,
        taxAmount: 0,
        total: 0,
      },
    });

    return { success: true };
  }),

  // Kupon uygula
  applyCoupon: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const cart = await getOrCreateCart(ctx.user.id);
      const code = input.code.toUpperCase().trim();

      // Kuponu bul
      const coupon = await prisma.coupon.findUnique({
        where: { code },
      });

      if (!coupon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Geçersiz kupon kodu",
        });
      }

      // Durum kontrolü
      if (coupon.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu kupon artık geçerli değil",
        });
      }

      // Tarih kontrolü
      const now = new Date();
      if (coupon.startsAt > now) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu kupon henüz aktif değil",
        });
      }

      if (coupon.expiresAt && coupon.expiresAt < now) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu kuponun süresi dolmuş",
        });
      }

      // Kullanım limiti kontrolü
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu kuponun kullanım limiti dolmuş",
        });
      }

      // Kullanıcı başına limit kontrolü
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId: ctx.user.id,
        },
      });

      if (userUsageCount >= coupon.usagePerUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu kuponu daha fazla kullanamazsınız",
        });
      }

      // Minimum tutar kontrolü
      if (coupon.minOrderAmount && cart.subtotal.lessThan(coupon.minOrderAmount)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum sipariş tutarı: €${coupon.minOrderAmount}`,
        });
      }

      // Kullanıcı kısıtlama kontrolü
      if (coupon.userIds.length > 0 && !coupon.userIds.includes(ctx.user.id)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bu kupon hesabınız için geçerli değil",
        });
      }

      // Kuponu uygula
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          couponId: coupon.id,
          couponCode: coupon.code,
        },
      });

      const totals = await calculateCartTotals(cart.id);

      return {
        success: true,
        discount: totals?.discountAmount.toString() || "0",
        message: `Kupon uygulandı: ${coupon.type === "PERCENTAGE" ? `%${coupon.value}` : `€${coupon.value}`} indirim`,
      };
    }),

  // Kuponu kaldır
  removeCoupon: protectedProcedure.mutation(async ({ ctx }) => {
    const cart = await getOrCreateCart(ctx.user.id);

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        couponId: null,
        couponCode: null,
      },
    });

    await calculateCartTotals(cart.id);

    return { success: true };
  }),

  // Checkout başlat - Order oluştur
  checkout: protectedProcedure.mutation(async ({ ctx }) => {
    const cart = await getOrCreateCart(ctx.user.id);

    if (cart.items.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Sepetiniz boş",
      });
    }

    // Sepet durumunu güncelle
    await prisma.cart.update({
      where: { id: cart.id },
      data: { status: "CHECKOUT" },
    });

    // Order number oluştur
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `HYB-${dateStr}-${randomPart}`;

    // Order oluştur
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: ctx.user.id,
        cartId: cart.id,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal: cart.subtotal,
        discountAmount: cart.discountAmount,
        taxRate: 20,
        taxAmount: cart.taxAmount,
        total: cart.total,
        currency: cart.currency,
        couponId: cart.couponId,
        couponCode: cart.couponCode,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice.mul(item.quantity),
            currency: item.currency,
            productName: item.productName,
            variantName: item.variantName,
            productSlug: item.productSlug,
          })),
        },
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total.toString(),
      currency: order.currency,
    };
  }),
});
