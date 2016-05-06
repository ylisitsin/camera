(function () {
    var video = document.querySelector('.camera__video'),
        canvas = document.querySelector('.camera__canvas');

    var getVideoStream = function (callback) {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function (e) {
                        video.play();

                        callback();
                    };
                },
                function (err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };

    var applyFilterToPixel = function (pixel) {
        var filters = {
            invert: function (pixel) {
                for (var i = 0; i < pixel.length; i += 4) {
                    pixel[i] = 255 - pixel[i];
                    pixel[i+1] = 255 - pixel[i+1];
                    pixel[i+2] = 255 - pixel[i+2];
                }

                return pixel;
            },
            grayscale: function (pixel) {
                for (var i = 0; i < pixel.length; i += 4) {
                    var r = pixel[i];
                    var g = pixel[i+1];
                    var b = pixel[i+2];
                    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                    pixel[i] = pixel[i+1] = pixel[i+2] = v;
                }
                return pixel;
            },
            threshold: function (pixel) {
                for (var i = 0; i < pixel.length; i += 4) {
                    var r = pixel[i];
                    var g = pixel[i+1];
                    var b = pixel[i+2];
                    var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 128) ? 255 : 0;

                    pixel[i] = pixel[i+1] = pixel[i+2] = v;
                }

                return pixel;
            }
        };

        var filterName = document.querySelector('.controls__filter').value;

        return filters[filterName](pixel);
    };

    var applyFilter = function () {
                var pixel = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

                pixel.data = applyFilterToPixel(pixel.data);

                canvas.getContext('2d').putImageData(pixel, 0, 0);
    };

    var captureFrame = function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvas.getContext('2d').drawImage(video, 0, 0);
        applyFilter();
    };

    getVideoStream(function () {
        captureFrame();

        setInterval(captureFrame, 16);
    });
})();
