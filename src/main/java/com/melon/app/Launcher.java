package com.melon.app;

import java.io.PrintStream;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class Launcher {

    static String logo = " ________  ___       ________  ________   ___           ___    ___ \r\n" + //
                "|\\   __  \\|\\  \\     |\\   __  \\|\\   ___  \\|\\  \\         |\\  \\  /  /|\r\n" + //
                "\\ \\  \\|\\  \\ \\  \\    \\ \\  \\|\\  \\ \\  \\\\ \\  \\ \\  \\        \\ \\  \\/  / /\r\n" + //
                " \\ \\   ____\\ \\  \\    \\ \\   __  \\ \\  \\\\ \\  \\ \\  \\        \\ \\    / / \r\n" + //
                "  \\ \\  \\___|\\ \\  \\____\\ \\  \\ \\  \\ \\  \\\\ \\  \\ \\  \\____    \\/  /  /  \r\n" + //
                "   \\ \\__\\    \\ \\_______\\ \\__\\ \\__\\ \\__\\\\ \\__\\ \\_______\\__/  / /    \r\n" + //
                "    \\|__|     \\|_______|\\|__|\\|__|\\|__| \\|__|\\|_______|\\___/ /     \r\n" + //
                "                                                      \\|___|/      \r\n" + //
                "      * Plan Smarter, Achieve More *\n";

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Launcher.class);
        app.setBanner(new Banner() {
            @Override
            public void printBanner(Environment env, Class<?> sourceClass, PrintStream out) {
                out.println(logo);
            }   
        });
        app.run(args);
    }
}
