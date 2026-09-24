export function loadScript(doc, src, options = {}) {
  return new Promise((resolve, reject) => {
    const script = doc.createElement("script");
    script.src = src;
    script.async = true;
    Object.entries(options.attributes || {}).forEach(([name, value]) =>
      script.setAttribute(name, value),
    );
    script.onload = () => {
      options.ready?.();
      resolve();
    };
    script.onerror = () => reject(new Error(`Vendor script failed: ${src}`));
    doc.head.append(script);
  });
}
