(function () {
    const canvas = $("canvas");
    const canvasContext = canvas[0].getContext("2d");
    let mouseDown = false;
    let offset = canvas[0].getBoundingClientRect();
    let left;
    let top;
    let dataURL;

    canvas
        .on("mousedown", (event) => {
            mouseDown = true;
            left = event.clientX - offset.left;
            top = event.clientY - offset.top;
            canvasContext.moveTo(left, top);
        })
        .on("mousemove", (event) => {
            if (mouseDown) {
                event.stopPropagation();
                left = event.clientX - offset.left;
                top = event.clientY - offset.top;
                canvasContext.lineTo(left, top);
                canvasContext.stroke();

                dataURL = canvas[0].toDataURL();
                $("#signature").val(dataURL);
            }
        });

    $("body").on("mouseup", (event) => {
        mouseDown = false;
        event.stopPropagation();
    });
})();

// (function () {
//     var canvas = document.getElementById("canvas"); //canvas element
//     var context = canvas.getContext("2d"); //context element
//     var clickX = new Array();
//     var clickY = new Array();
//     var clickDrag = new Array();
//     var paint;

//     canvas.addEventListener("mousedown", mouseDown, false);
//     canvas.addEventListener("mousemove", mouseXY, false);
//     document.body.addEventListener("mouseup", mouseUp, false);

//     var sigData;
//     function draw() {
//         // context.clearRect(0, 0, canvas.width, canvas.height); // Clears the canvas

//         context.lineWidth = 2; //"ink" width

//         for (var i = 0; i < clickX.length; i++) {
//             context.beginPath(); //create a path
//             if (clickDrag[i] && i) {
//                 context.moveTo(clickX[i - 1], clickY[i - 1]); //move to
//             } else {
//                 context.moveTo(clickX[i] - 1, clickY[i]); //move to
//             }
//             context.lineTo(clickX[i], clickY[i]); //draw a line

//             context.stroke(); //filled with "ink"
//             context.closePath(); //close path
//         }

//         function saveSig() {
//             sigData = canvas.toDataURL("image/png");
//             $("#signature").val(sigData);
//             console.log("sigdata", sigData);
//         }
//     }
//     //Save the Sig

//     saveSig();

//     function addClick(x, y, dragging) {
//         clickX.push(x);
//         clickY.push(y);
//         clickDrag.push(dragging);
//     }

//     function mouseXY(e) {
//         if (paint) {
//             addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
//             draw();
//         }
//     }

//     function mouseUp() {
//         paint = false;
//     }

//     function mouseDown(e) {
//         var mouseX = e.pageX - this.offsetLeft;
//         var mouseY = e.pageY - this.offsetTop;

//         paint = true;
//         addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
//         draw();
//     }
// })();
