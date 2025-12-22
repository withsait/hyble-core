plugins {
    java
    `java-library`
    id("com.github.johnrengelman.shadow") version "8.1.1" apply false
}

subprojects {
    apply(plugin = "java")
    apply(plugin = "java-library")

    group = "co.hyble"
    version = "1.0.0-SNAPSHOT"

    java {
        toolchain {
            languageVersion.set(JavaLanguageVersion.of(21))
        }
    }

    tasks.withType<JavaCompile> {
        options.encoding = "UTF-8"
        options.release.set(21)
    }

    tasks.withType<Test> {
        useJUnitPlatform()
    }
}

tasks.register("cleanAll") {
    group = "build"
    description = "Cleans all project builds"
    dependsOn(subprojects.map { it.tasks.named("clean") })
}
