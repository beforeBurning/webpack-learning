module.exports = async function (content) {
  const pathSrc = this._module.rawRequest;
  let newContent = "";
  const lineArr = content.split("\n");
  lineArr.forEach((item, idx) => {
    if (item.includes("console")) {
      let text = item.replace(
        "console.log(",
        `console.log('文件: ${pathSrc}', '行数: ${idx}',`
      );
      newContent += `${text}\r\n`;
    } else {
      newContent += `${item}\r\n`;
    }
  });
  return newContent;
};
