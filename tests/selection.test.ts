import { segmentsFromSelection } from "../src/features/reader/selection";

function setup() {
  document.body.innerHTML = `
    <div id="root">
      <p data-block-id="a-1"><span>First </span><mark>marked</mark><span> paragraph.</span></p>
      <p data-block-id="a-2"><span>Second paragraph here.</span></p>
    </div>`;
  return document.getElementById("root")!;
}

describe("segmentsFromSelection", () => {
  it("maps a selection inside one block to stable offsets, ignoring existing marks", () => {
    const root = setup();
    const text = root.querySelector("mark")!.firstChild!;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(root.querySelectorAll("span")[1].firstChild!, 6);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
    expect(segmentsFromSelection(root, sel)).toEqual([{ blockId: "a-1", start: 6, end: 18, text: "marked parag" }]);
  });

  it("splits a selection across paragraphs into one segment per block", () => {
    const root = setup();
    const range = document.createRange();
    range.setStart(root.querySelectorAll("span")[1].firstChild!, 1);
    range.setEnd(root.querySelectorAll("span")[2].firstChild!, 6);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
    const segs = segmentsFromSelection(root, sel);
    expect(segs.map((s) => s.blockId)).toEqual(["a-1", "a-2"]);
    expect(segs[0].text).toBe("paragraph.");
    expect(segs[1]).toMatchObject({ start: 0, end: 6, text: "Second" });
  });
});
