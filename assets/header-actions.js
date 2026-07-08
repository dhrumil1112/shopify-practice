import { Component } from "@theme/component";
import { StandardEvents, CartLinesUpdateEvent } from "@shopify/events";
import { DrawerOpenEvent, DrawerCloseEvent } from "@theme/theme-drawer";

/**
 * Header actions component that manages cart notifications and the
 * cart-drawer trigger's `aria-expanded` state.
 *
 * @typedef {object} Refs
 * @property {HTMLElement} liveRegion - The live region for cart announcements.
 *
 * @extends {Component<Refs>}
 */
class HeaderActions extends Component {
  requiredRefs = ["liveRegion"];

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(
      StandardEvents.cartLinesUpdate,
      this.#onCartUpdate,
    );
    document.addEventListener(
      DrawerOpenEvent.eventName,
      this.#onDrawerStateChange,
    );
    document.addEventListener(
      DrawerCloseEvent.eventName,
      this.#onDrawerStateChange,
    );
    this.#syncCartTriggerAriaExpanded();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      StandardEvents.cartLinesUpdate,
      this.#onCartUpdate,
    );
    document.removeEventListener(
      DrawerOpenEvent.eventName,
      this.#onDrawerStateChange,
    );
    document.removeEventListener(
      DrawerCloseEvent.eventName,
      this.#onDrawerStateChange,
    );
  }

  #syncCartTriggerAriaExpanded = () => {
    const cartDrawer = document.getElementById("cart-drawer");
    if (!cartDrawer) return;
    const trigger = this.querySelector('[aria-controls="cart-drawer"]');
    if (!trigger) return;
    trigger.setAttribute(
      "aria-expanded",
      cartDrawer.hasAttribute("open") ? "true" : "false",
    );
  };

  /**
   * Syncs `aria-expanded` on the cart-drawer trigger when the drawer opens or closes.
   * @param {Event} event
   */
  #onDrawerStateChange = (event) => {
    const target = /** @type {HTMLElement | null} */ (event.target);
    if (target?.id !== "cart-drawer") return;
    this.#syncCartTriggerAriaExpanded();
  };

  /**
   * Handles cart update events and announces the new count to screen readers.
   * @param {CartLinesUpdateEvent} event
   */
  #onCartUpdate = (event) => {
    event.promise
      ?.then(({ cart }) => {
        const cartCount = cart?.totalQuantity;
        if (cartCount === undefined) return;

        this.refs.liveRegion.textContent = `${Theme.translations.cart_count}: ${cartCount}`;
      })
      .catch((error) => {
        if (error?.name !== "AbortError")
          console.warn("[header-actions] Event promise rejected:", error);
      });
  };
}

if (!customElements.get("header-actions")) {
  customElements.define("header-actions", HeaderActions);
}

document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".account-button");
  const account = document.querySelector("shopify-account");

  if (!wrapper || !account) return;

  let ticking = false;

  const updatePosition = () => {
    const dialog = account.shadowRoot?.querySelector("dialog");
    if (!dialog) return;

    if (window.innerWidth <= 750) {
      dialog.style.top = "";
      dialog.style.right = "";
      dialog.style.left = "";
      dialog.style.bottom = "";
      return;
    }

    const rect = wrapper.getBoundingClientRect();

    dialog.style.top = rect.bottom + "px";
    dialog.style.right = window.innerWidth - rect.right + "px";
    dialog.style.left = "auto";
    dialog.style.bottom = "auto";
  };

  const waitForShadow = setInterval(() => {
    if (account.shadowRoot) {
      clearInterval(waitForShadow);

      const style = document.createElement("style");
      style.textContent = `
            .account-button__avatar {
                box-shadow: none !important;

                &:hover {
                  scale: unset !important;
                }
            }
            `;
      account.shadowRoot.appendChild(style);
      account.style.opacity = "1";

      const dialog = account.shadowRoot.querySelector("dialog");

      if (!dialog) return;

      const observer = new MutationObserver(() => {
        if (dialog.hasAttribute("open")) {
          updatePosition();
        }
      });

      observer.observe(dialog, {
        attributes: true,
        attributeFilter: ["open"],
      });

      window.addEventListener("resize", () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            updatePosition();
            ticking = false;
          });
          ticking = true;
        }
      });
    }
  }, 100);
});
