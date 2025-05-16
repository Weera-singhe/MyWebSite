$("#chooseOp").on("change", chooseOp);

var idCB = [
  "#incPlates",
  "#incPaper",
  "#incPrint",
  "#incAw",
  "#incCut",
  "#incGt",
  "#incPd",
  "#incPk",
  "#incDlv",
];
var idOP = [
  "#op1",
  ".op2",
  "#op3",
  "#opX1",
  "#opX2",
  "#opX3",
  "#opX4",
  "#opX5",
  "#opX6",
];
function chooseOp() {
  for (let i = 0; i < idCB.length; i++) {
    if ($(idCB[i]).is(":checked")) {
      $(idOP[i]).show();
    } else {
      $(idOP[i]).hide();
    }
  }
  chooseOp2x();
}

function chooseOp2x() {
  var count = Number($("#op2count").val()) + 1;
  for (let i = 1; i < 11; i++) {
    if (i < count) {
      $("#div4op2x" + i).show();
    } else {
      $("#div4op2x" + i).hide();
    }
  }
}
chooseOp();
