$("#chooseOp").on("change", chooseOp);

var idCB = [
  "#incPlates",
  "#incPaper",
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
  "#opX1",
  "#opX2",
  "#opX3",
  "#opX4",
  "#opX5",
  "#opX6",
];
function loadAllPapers() {
  var allPapers = [];
  function addPaper(name, gsm, sizeH, sizeW, brand, stock, price) {
    this.name = name;
    this.gsm = gsm;
    this.sizeH = sizeH;
    this.sizeW = sizeW;
    this.brand = brand;
    this.stock = stock;
    this.price = price;
    allPapers.push(this);
  }
  new addPaper("bank", 60, 24, 36, "jappan", 5000, 7000);
  new addPaper("art", 70, 24, 34, "jappan", 2000, 8000);
  new addPaper("bank", 80, 20, 30, "jappan", 10000, 9000);

  var selectInnerHtml = "";
  for (let i = 0; i < allPapers.length; i++) {
    selectInnerHtml += `<option data-num='${allPapers[i].price}'>${allPapers[i].name} ${allPapers[i].gsm}gsm ${allPapers[i].brand} ${allPapers[i].sizeH}x${allPapers[i].sizeW}</option>`;
  }
  $(".slctPaper").html(selectInnerHtml);
}
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

loadAllPapers();
chooseOp();
