(function () {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var clickX = [];
    var clickY = [];
    var clickDrag = [];
    var paint;

    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mousemove", mouseXY, false);
    document.body.addEventListener("mouseup", mouseUp, false);

    function draw() {
        context.clearRect(0, 0, 0, 0);

        context.strokeStyle = "red";

        context.lineWidth = 3;

        for (var i = 0; i < clickX.length; i++) {
            context.beginPath(); //create a path

            if (clickDrag[i] && i) {
                context.moveTo(clickX[i - 1], clickY[i - 1]); //move to
            } else {
                context.moveTo(clickX[i] - 1, clickY[i]); //move to
            }
            context.lineTo(clickX[i], clickY[i]); //draw a line
            context.stroke(); //filled with "ink"
            context.closePath(); //close path
        }
    }

    function addClick(x, y, dragging) {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
    }

    function mouseXY(e) {
        if (paint) {
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            draw();
        }
    }

    function mouseUp() {
        paint = false;
    }

    function mouseDown(e) {
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        paint = true;
        addClick(mouseX, mouseY, true);
        draw();
    }
})();
