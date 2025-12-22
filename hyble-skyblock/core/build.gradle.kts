plugins {
    `java-library`
    id("com.github.johnrengelman.shadow")
}

dependencies {
    // API module
    api(project(":api"))

    // Paper API
    compileOnly("io.papermc.paper:paper-api:${property("paperVersion")}")

    // Configuration
    implementation("org.spongepowered:configurate-yaml:${property("configurateVersion")}")

    // Database
    implementation("com.zaxxer:HikariCP:${property("hikariVersion")}")
    implementation("org.xerial:sqlite-jdbc:${property("sqliteVersion")}")
    implementation("org.postgresql:postgresql:${property("postgresqlVersion")}")
    implementation("com.mysql:mysql-connector-j:${property("mysqlVersion")}")

    // Cache
    implementation("com.github.ben-manes.caffeine:caffeine:${property("caffeineVersion")}")

    // Redis (optional)
    compileOnly("redis.clients:jedis:${property("jedisVersion")}")

    // Soft dependencies
    compileOnly("me.clip:placeholderapi:${property("placeholderApiVersion")}")
    compileOnly("com.github.MilkBowl:VaultAPI:${property("vaultVersion")}")
}

tasks {
    processResources {
        val props = mapOf("version" to project.version)
        inputs.properties(props)
        filesMatching("plugin.yml") {
            expand(props)
        }
    }

    shadowJar {
        archiveClassifier.set("")
        archiveFileName.set("HybleSkyblock-${project.version}.jar")

        relocate("org.spongepowered.configurate", "co.hyble.skyblock.lib.configurate")
        relocate("com.zaxxer.hikari", "co.hyble.skyblock.lib.hikari")
        relocate("com.github.benmanes.caffeine", "co.hyble.skyblock.lib.caffeine")
        relocate("org.xerial", "co.hyble.skyblock.lib.xerial")

        minimize {
            exclude(dependency("org.xerial:.*"))
            exclude(dependency("org.postgresql:.*"))
            exclude(dependency("com.mysql:.*"))
        }
    }

    build {
        dependsOn(shadowJar)
    }

    jar {
        enabled = false
    }
}
