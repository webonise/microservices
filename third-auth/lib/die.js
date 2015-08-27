module.exports = function(err) {
  console.trace();
  console.log(err);
  process.exit(1);
};
