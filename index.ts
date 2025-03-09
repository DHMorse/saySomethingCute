/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";

export default definePlugin({
    name: "Say Something Cute",
    description: "It changes the message input placeholder to 'Send something cute... ✨'",
    version: "1.0.1",
    authors: [{ name: null, id: null }],

    start() {
        // Run initially
        this.replacePlaceholder();

        // Set up a mutation observer to handle dynamically loaded elements and changes
        this.observer = new MutationObserver(mutations => {
            // Check if any mutations affected text content or attributes that might contain placeholders
            const shouldReplace = mutations.some(mutation =>
                mutation.type === "childList" ||
                mutation.type === "characterData" ||
                (mutation.type === "attributes" && mutation.attributeName === "aria-label")
            );

            if (shouldReplace) {
                this.replacePlaceholder();
            }
        });

        // Start observing the document body for changes
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["aria-label"]
        });

        // Add event listener for message send to immediately re-apply our placeholder
        document.addEventListener("keydown", this.handleKeyDown.bind(this));

        // Also set interval as a fallback to ensure our placeholder stays
        this.interval = setInterval(() => this.replacePlaceholder(), 500);
    },

    stop() {
        // Clean up when the plugin is disabled
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        // Clear our interval
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        // Remove event listener
        document.removeEventListener("keydown", this.handleKeyDown.bind(this));

        // Restore original placeholders
        const messageInputs = document.querySelectorAll('[aria-label^="Send something cute"]');
        messageInputs.forEach(input => {
            const channel = input.closest('[class*="channelTextArea"]')?.getAttribute("aria-label");
            if (channel) {
                const channelName = channel.replace("Chat in ", "");
                input.setAttribute("aria-label", `Message ${channelName}`);
                if (input.parentElement) {
                    const placeholderElements = input.parentElement.querySelectorAll('[class*="placeholder"]');
                    placeholderElements.forEach(placeholder => {
                        if (placeholder.textContent && placeholder.textContent.includes("Send something cute")) {
                            placeholder.textContent = `Message ${channelName}`;
                            const el = placeholder as HTMLElement;
                            el.style.fontStyle = "normal";
                            el.style.color = "";
                        }
                    });
                }
            }
        });
    },

    // Function to handle keydown events
    handleKeyDown(e: KeyboardEvent) {
        // Check if Enter key was pressed and not with shift (which typically creates a new line)
        if (e.key === "Enter" && !e.shiftKey) {
            // Small delay to let Discord update the UI first
            setTimeout(() => this.replacePlaceholder(), 50);
        }
    },

    // Function to replace the placeholder text
    replacePlaceholder() {
        // Find all message input elements with various possible selectors
        const selectors = [
            '[aria-label^="Message @"]',
            '[aria-label^="Message #"]',
            '[aria-label^="Message in"]',
            '[class*="slateTextArea"]',
            '[class*="textArea"]',
            '[role="textbox"]'
        ];

        const messageInputs = document.querySelectorAll(selectors.join(","));

        messageInputs.forEach(input => {
            // Skip elements that already have our custom text
            if (input.getAttribute("aria-label") === "Send something cute... ✨") {
                return;
            }

            // Change the aria-label to our custom text
            input.setAttribute("aria-label", "Send something cute... ✨");

            if (input.parentElement) {
                const placeholderElements = input.parentElement.querySelectorAll('[class*="placeholder"]');
                placeholderElements.forEach(placeholder => {
                    if (placeholder.textContent) {
                        placeholder.textContent = "Send something cute... ✨";
                        // Add italic styling and pink color to the placeholder
                        const el = placeholder as HTMLElement;
                        el.style.fontStyle = "italic";
                        el.style.color = "#ff66b2";
                    }
                });
            }
        });
    }
});
