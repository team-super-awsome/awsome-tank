module.exports = {
  timedout: function (start, milliseconds) {
    return (process.hrtime(start)[0] * 1000 + process.hrtime(start)[1] / 1000000) > milliseconds;
  }
};
