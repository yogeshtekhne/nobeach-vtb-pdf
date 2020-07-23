const customTransforms = {
  'test3': (obj, params) => {
    console.log(obj.src);
    console.log(obj.dst);
    console.log(params);
    return obj;
  }
};

module.exports = customTransforms;
