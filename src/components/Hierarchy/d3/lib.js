export const pathGenerator = (source, destination) => {
    return `M ${source.y} ${source.x}
    C ${(source.y + destination.y) / 2} ${source.x},
      ${(source.y + destination.y) / 2} ${destination.x},
      ${destination.y} ${destination.x}`;
};

export const getTranslation = transform => {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttributeNS(null, 'transform', transform);
    var matrix = g.transform.baseVal.consolidate().matrix;
    return [matrix.e, matrix.f];
};
