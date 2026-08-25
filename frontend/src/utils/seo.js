const DEFAULTS = {
  title: "Smart City Jamshoro | Premium Real Estate",
  description:
    "Discover residential and commercial property opportunities in Smart City Jamshoro, Sindh.",
  image: "/favicon.svg",
};

export function setSeo({ title, description, image, url } = {}) {
  const finalTitle = title || DEFAULTS.title;
  const finalDescription = description || DEFAULTS.description;
  const finalImage = image || DEFAULTS.image;
  const finalUrl = url || window.location.href;

  document.title = finalTitle;

  const setMeta = (selector, content, attribute = "name") => {
    let element = document.head.querySelector(`meta[${attribute}="${selector}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, selector);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  };

  setMeta("description", finalDescription);
  setMeta("og:title", finalTitle, "property");
  setMeta("og:description", finalDescription, "property");
  setMeta("og:image", new URL(finalImage, window.location.origin).href, "property");
  setMeta("og:url", finalUrl, "property");
  setMeta("og:type", "website", "property");
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", finalTitle);
  setMeta("twitter:description", finalDescription);
  setMeta("twitter:image", new URL(finalImage, window.location.origin).href);
}
