const replaceTemplate = (tempHtml, propsMap) => {
  try {
    let res = tempHtml;

    Object.keys(propsMap).some((key) => {
      const reg = new RegExp(`{%${key}%}`, 'g');

      const newValue =
        key === 'organic'
          ? propsMap[key]
            ? ''
            : 'not-organic'
          : propsMap[key];

      res = res.replace(reg, newValue);
      return false;
    });

    return res;
  } catch (err) {
    console.error(err);
    return '';
  }
};

module.exports = replaceTemplate;
