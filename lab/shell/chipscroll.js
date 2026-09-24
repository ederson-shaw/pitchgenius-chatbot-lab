function scrollOnWheel(event) {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

  event.currentTarget.scrollLeft += event.deltaY;
  event.preventDefault();
}

export function bindChipScroll() {
  const bar = document.querySelector(".chip-groups");

  if (!bar) return;

  bar.addEventListener("wheel", scrollOnWheel, { passive: false });
  bar.querySelector(".vendor-chip.active, .vendor-chip[aria-pressed='true']")?.scrollIntoView({
    block: "nearest",
    inline: "center",
  });
}
