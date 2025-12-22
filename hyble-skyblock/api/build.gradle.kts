plugins {
    `java-library`
    `maven-publish`
}

dependencies {
    // Paper API - compile only for API module
    compileOnly("io.papermc.paper:paper-api:${property("paperVersion")}")
}

java {
    withSourcesJar()
    withJavadocJar()
}

publishing {
    publications {
        create<MavenPublication>("mavenJava") {
            from(components["java"])

            pom {
                name.set("HybleSkyblock API")
                description.set("API for HybleSkyblock plugin")
                url.set("https://hyble.co")
            }
        }
    }
}
