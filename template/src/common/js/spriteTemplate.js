const template = function (data) {
  const spritesheet = data.spritesheet;
  const w = spritesheet.width;
  const h = spritesheet.height;
  const shared =
    ".icon { display: inline-block; vertical-align: middle; background-image: url(I);background-size:Wpx Hpx }"
      .replace("I", data.sprites[0].image)
      .replace("W", w)
      .replace("H", h);

  const perSprite = data.sprites
    .map(function (sprite) {
      return ".icon-N { width: Wpx; height:Hpx; background-position: Xpx Ypx;}"
        .replace("N", sprite.name)
        .replace("W", sprite.width)
        .replace("H", sprite.height)
        .replace("X", sprite.offset_x)
        .replace("Y", sprite.offset_y);
    })
    .join("\n");

  return shared + "\n" + perSprite;
};
export default template;
