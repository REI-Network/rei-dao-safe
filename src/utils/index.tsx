export const addr = (str:string) => {
  var first = str.substr(0, 6);
  var last = str.substr(str.length - 4);
  return first + '...' + last;
}

export const asset = (value:any, precision = 2)=> {
  if (isNaN(Number(value))) {
    return value || '0';
  }
  if (!value) {
    value = '0';
  }
  value = value + '';
  // precision = (value.indexOf('.') > -1 && value.split('.')[1].length) || precision;
  // if (precision > 5) {
  //   precision = 5;
  // }
  value = parseFloat(value.replace(/[^\d.-]/g, '')).toFixed(precision) + '';
  var l = value
    .split('.')[0]
    .split('')
    .reverse();
  var r = value.split('.')[1];
  var t = '';
  for (var i = 0; i < l.length; i++) {
    t += l[i] + ((i + 1) % 3 == 0 && i + 1 != l.length ? ',' : '');
  }
  if (precision == 0) {
    return t
      .split('')
      .reverse()
      .join('');
  }
  return (
    t
      .split('')
      .reverse()
      .join('') +
    '.' +
    r
  );
}
