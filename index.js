var editor = {
    initialize: function () {
        var leftButtonDown = false;

        editor.general.changeTool();
        editor.general.controls();
        editor.functions.brush();
        editor.functions.eraser();
        editor.functions.eyedrop();
        editor.functions.clear();
        editor.functions.palette();
        editor.functions.fill();
        editor.functions.popup.basic();
        editor.functions.save();
        editor.functions.load();
        editor.functions.savePNG();
        editor.functions.texture_brush();
        editor.functions.settings();

        $(document).mousedown(function (e) {
            if (e.which === 1) leftButtonDown = true;
        });
        $(document).mouseup(function (e) {
            if (e.which === 1) leftButtonDown = false;
        });
    },
    general: {
        collision: function ($div1, $div2) {
            var x1 = $div1.offset().left;
            var y1 = $div1.offset().top;
            var h1 = $div1.outerHeight(true);
            var w1 = $div1.outerWidth(true);
            var b1 = y1 + h1;
            var r1 = x1 + w1;
            var x2 = $div2.offset().left;
            var y2 = $div2.offset().top;
            var h2 = $div2.outerHeight(true);
            var w2 = $div2.outerWidth(true);
            var b2 = y2 + h2;
            var r2 = x2 + w2;

            if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
            return true;
        },
        getColor: function () {
            return "#" + $("#palette").val();
        },
        random: function (x, y) {
            return Math.floor(Math.random() * (y - x + 1) + x);
        },
        changeTool: function () {
            /* START CHANGETOOL */

            $(".tools .tool").each(function () {
                var t = $(this),
                    a = "active";

                t.click(function () {
                    if (!t.hasClass(a)) {
                        $(".tools .tool").removeClass(a);
                        t.addClass(a);
                    }
                });
            });

            console.log("general.changeTool: OK");

            /* END CHANGETOOL */
        },
        changeColor: function (color) {
            /* START CHANGECOLOR */
            if (!color) return false;
            if (!/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color)) return false;
            document.getElementById("palette").jscolor.fromString(color);
            /* END CHANGECOLOR */
        },
        mouseMoveEvent: function (e) {
            if (!(document.documentMode >= 9) && !event.button) {
                leftButtonDown = false;
            }
            if (e.which === 1 && !leftButtonDown) {
                return 1;
            }
        },
        saveToJSON: function () {
            var json = [];
            $(".cell").each(function (i) {
                var bg = $(this).css("background-color");

                var string = $(this).css("background"),
                    expr = /url/;
                if (expr.test(string)) {
                    json[i] = "t";
                } else {
                    var rgb = $(this).
                        css("background").
                        replace(/\s/g, "").
                        split("(")[1].
                        split(")")[0];
                    var r = rgb.split(",")[0];
                    var g = rgb.split(",")[1];
                    var b = rgb.split(",")[2];

                    json[i] = editor.general.rgbToHex(r, g, b);
                }
            });

            return json;
        },
        loadFromJSON: function (json) {
            $(".cell").each(function (i) {
                var t = $(this),
                    color = json[i];
                if (json[i] == "t") {
                    t.css({
                        background: "url('https://goo.gl/1Wgos3')",
                        "background-size": "15.5px"
                    });

                } else {
                    t.css("background", color);
                }
            });
        },
        downloadCanvas: function (link, canvasId, filename) {
            console.log("odp");
            link.href = document.getElementById(canvasId).toDataURL();
            link.download = filename;
        },
        rgbToHex: function (r, g, b) {
            var rgb = b | g << 8 | r << 16;
            return "#" + (0x1000000 + rgb).toString(16).slice(1);
        },
        hexToRgb: function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ?
                {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } :

                null;
        },
        controls: function () {
            var dcr;
            var sqc = [];
            $(".cell").on("mousemove", function (e) {
                var t = $(this);
                if (e.shiftKey) {
                    if (sqc.length < 2) {
                        var t = $(this),
                            s = t.attr("data-cell-sequence"),
                            r = t.attr("data-cell-row");
                        sqc.push(r + "," + s);
                        sqc = sqc.filter(function (a) {
                            if (!this[a]) {
                                this[a] = 1;
                                return a;
                            }
                        }, {});

                        var r0 = sqc[0].split(",")[0];
                        var r1 = sqc[1].split(",")[0];

                        var s0 = sqc[0].split(",")[1];
                        var s1 = sqc[1].split(",")[1];

                        if (r0 > r1 || r0 < r1 && s0 == s1) {
                            // row
                            var row = s0;
                            dcr = ["y", row];
                        }

                        if (s0 > s1 || s0 < s1 && r0 == r1) {
                            // seq
                            var seq = r0;
                            dcr = ["x", seq];
                        }
                    }

                    // START SHIFT FUNCTIONS FOR TOOLS

                    var Color = net.brehaut.Color;
                    var base = Color(editor.general.getColor());

                    var basic = base.getLightness();
                    var lght = basic += 0.25 * Math.random() - 0.125;
                    0 > lght ? lght = 0 : 1 < lght && (lght = 1);

                    var ready = base.setLightness(lght);

                    $("#brush").hasClass("active") && (

                        "x" == dcr[0] && (

                            "1" == editor.general.mouseMoveEvent(e) &&
                            t.attr("data-cell-row") == dcr[1] &&
                            t.css({ background: editor.general.getColor() }),
                            t.attr("data-cell-row") == dcr[1] &&
                            $(".cell[data-cell-row=" + dcr[1] + "]").addClass(
                                "shift_glow_y")),


                        "y" == dcr[0] && (

                            "1" == editor.general.mouseMoveEvent(e) &&
                            t.attr("data-cell-sequence") == dcr[1] &&
                            t.css({ background: editor.general.getColor() }),
                            t.attr("data-cell-sequence") == dcr[1] &&
                            $(".cell[data-cell-sequence=" + dcr[1] + "]").addClass(
                                "shift_glow_x")));




                    $("#eraser").hasClass("active") && (

                        "x" == dcr[0] && (

                            "1" == editor.general.mouseMoveEvent(e) &&
                            t.attr("data-cell-row") == dcr[1] &&
                            t.css({
                                background: "url(https://goo.gl/1Wgos3)",
                                "background-size": "15.5px"
                            }),

                            t.attr("data-cell-row") == dcr[1] &&
                            $(".cell[data-cell-row=" + dcr[1] + "]").addClass(
                                "shift_glow_y")),


                        "y" == dcr[0] && (

                            "1" == editor.general.mouseMoveEvent(e) &&
                            t.attr("data-cell-sequence") == dcr[1] &&
                            t.css({
                                background: "url(https://goo.gl/1Wgos3)",
                                "background-size": "15.5px"
                            }),

                            t.attr("data-cell-sequence") == dcr[1] &&
                            $(".cell[data-cell-sequence=" + dcr[1] + "]").addClass(
                                "shift_glow_x")));




                    $("#texture_brush").hasClass("active") && (

                        "x" == dcr[0] && (

                            "1" == editor.general.mouseMoveEvent(e) &&
                            t.attr("data-cell-row") == dcr[1] &&
                            t.css("background", ready.toRGB()),
                            t.attr("data-cell-row") == dcr[1] &&
                            $(".cell[data-cell-row=" + dcr[1] + "]").addClass(
                                "shift_glow_y")),


                        "y" == dcr[0] && (

                            "1" == editor.general.mouseMoveEvent(e) &&
                            t.attr("data-cell-sequence") == dcr[1] &&
                            t.css("background", ready.toRGB()),
                            t.attr("data-cell-sequence") == dcr[1] &&
                            $(".cell[data-cell-sequence=" + dcr[1] + "]").addClass(
                                "shift_glow_x")));




                    // END SHIFT FUNCTIONS FOR TOOLS
                } else {
                    sqc = [];
                    $(".cell").removeClass("shift_glow_x").removeClass("shift_glow_y");
                }
            });
        }
    },

    functions: {
        brush: function () {
            var el = $("#brush");

            el.click(function () {
                // paint cell after mouse move
                $(".cell").mousemove(function (e) {
                    var t = $(this);
                    if (
                        editor.general.mouseMoveEvent(e) == "1" &&
                        el.hasClass("active") &&
                        !e.shiftKey) {
                        t.css({ background: editor.general.getColor() });
                    }
                });
                $(".cell").click(function (e) {
                    var t = $(this);
                    el.hasClass("active") &&
                        t.css({ background: editor.general.getColor() });
                });
            });
            el.click();
        },
        eraser: function () {
            var el = $("#eraser");

            el.click(function () {
                $(".cell").mousemove(function (e) {
                    var t = $(this);
                    if (
                        editor.general.mouseMoveEvent(e) == "1" &&
                        el.hasClass("active") &&
                        !e.shiftKey) {
                        t.css({
                            background: "url(https://goo.gl/1Wgos3)",
                            "background-size": "15.5px"
                        });

                    }
                });
                $(".cell").click(function (e) {
                    var t = $(this);
                    el.hasClass("active") &&
                        t.css({
                            background: "url(https://goo.gl/1Wgos3)",
                            "background-size": "15.5px"
                        });

                });
            });
        },
        eyedrop: function () {
            $("#eye_dropper").click(function () {
                $(".cell").on("mousemove", function () {
                    if ($("#eye_dropper").hasClass("active")) {
                        var t = $(this);
                        var rgb = t.
                            css("background").
                            match(
                                /rgba?\(((25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,\s*?){2}(25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,?\s*([01]\.?\d*?)?\)/g);

                        $("#eye_dropper").css("background", rgb);
                    }
                });
                $(".cell").click(function () {
                    if ($("#eye_dropper").hasClass("active")) {
                        var color = this.style.background;
                        $("#eye_dropper").removeAttr("style");

                        var rgb = color.match(
                            /rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);

                        var red = rgb[1];
                        var green = rgb[2];
                        var blue = rgb[3];

                        var hex = editor.general.rgbToHex(red, green, blue);
                        editor.general.changeColor(hex);
                        $("#brush").click();
                    }
                });
            });
        },
        texture_brush: function () {
            var el = $("#texture_brush"),
                cell = $(".cell");
            el.click(function () {
                cell.mousemove(function (e) {
                    var t = $(this);
                    if (el.hasClass("active")) {
                        var Color = net.brehaut.Color;
                        var base = Color(editor.general.getColor());

                        var basic = base.getLightness();
                        var lght = basic += 0.25 * Math.random() - 0.125;
                        0 > lght ? lght = 0 : 1 < lght && (lght = 1);

                        var ready = base.setLightness(lght);

                        if (
                            editor.general.mouseMoveEvent(e) == "1" &&
                            el.hasClass("active") &&
                            !e.shiftKey) {
                            t.css("background", ready.toRGB());
                        }
                    }
                });
            });
        },
        pickcolor: function () {
            var el = $("#palette");
        },
        clear: function () {
            var el = $("#clear");
            el.click(function () {
                $(".cell").each(function () {
                    var t = $(this);
                    t.css({
                        background: "url(https://goo.gl/1Wgos3)",
                        "background-size": "15.5px"
                    });

                });
            });
        },
        palette: function () {
            $(".palette ul li a").click(function () {
                var rgb = $(this).
                    css("background").
                    replace(/\s/g, "").
                    split("(")[1].
                    split(")")[0];
                console.log(rgb);
                var r = rgb.split(",")[0];
                var g = rgb.split(",")[1];
                var b = rgb.split(",")[2];

                editor.general.changeColor(editor.general.rgbToHex(r, g, b));
                console.log(editor.general.rgbToHex(r, g, b));
            });
        },
        fill: function () {
            var el = $("#fill");
            el.click(function () {
                $(".cell").click(function () {
                    var t = $(this);
                    if (el.hasClass("active")) {
                        var color = t.
                            css("background").
                            match(
                                /rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/)[
                            0];

                        $(".cell").each(function () {
                            var x = $(this);
                            var x_color = x.
                                css("background").
                                match(
                                    /rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/)[
                                0];
                            if (x_color == color) {
                                x.css({
                                    background: editor.general.getColor()
                                });

                            }
                        });
                    }
                });
            });
        },
        popup: {
            basic: function () {
                $(".popup #close").click(function () {
                    $(".popup").hide();
                    $(".show_popup").removeClass("active");
                });
                $(".show_popup").click(function () {
                    $(".popup").hide();
                    $(".show_popup").removeClass("active");
                    $(this).toggleClass("active");
                });
            },
            toggle: function (x) {
                x.toggle();
            },
            show: function (x) {
                x.show();
            },
            hide: function (x) {
                $(x).hide();
            }
        },

        save: function () {
            $("#save").click(function () {
                if ($("#save").hasClass("active")) {
                    editor.functions.popup.show($("#save_pop"));
                    var t = $("#save_pop #json_area");
                    t.val(JSON.stringify(editor.general.saveToJSON()));
                }
            });
            $("#copyJSON").click(function () {
                $("#save_pop #json_area").select();
                document.execCommand("copy");
            });
        },
        load: function () {
            var el = $("#load"),
                t = $("#load_pop #json_area");

            el.click(function () {
                if (el.hasClass("active")) {
                    editor.functions.popup.show($("#load_pop"));
                }
            });

            $("#loadthis").click(function () {
                var json = $("#load_pop #json_area").val();
                var string = json.substring(1, json.length - 1).slice(",");
                var array = JSON.parse("[" + string + "]");
                editor.general.loadFromJSON(array);
                t.val("");
                $(".popup").hide();
            });
        },
        savePNG: function () {
            var canvas = document.getElementById("readyItem"),
                template = document.getElementById("toCanvas");
            var doDraw = function () {
                var h4t =
                    '<div class="editor" id="toCanvas">' +
                    $("#toCanvas").html() +
                    "</div><style>body{margin:0px;position: relative}#toCanvas{    transform: scaleX(1.022) translate(5px, 0px);}.cell{height: 16px;width: 16px;float: left}.row {display: flex;}</style>";
                rasterizeHTML.drawHTML(h4t, canvas);
            };

            $("#save").click(function () {
                canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
                doDraw();
            });
            $("#toPng").click(function () {
                console.log("klik");
                editor.general.downloadCanvas(this, "readyItem", "mcitem.png");
            });
        },
        settings: function () {
            var el = $("#settings"),
                popup = $("#settings_pop");

            el.click(function () {
                el.hasClass("active") && console.log("wow");
            });
        }
    }
};



editor.initialize();

var sword = ["t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#ff1212", "#ff1212", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#ff1212", "#ff4c2b", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#ff1212", "#ffeb3b", "#ff4c2b", "#ff4c2b", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#ff1212", "#ff1212", "#ffeb3b", "#ffeb3b", "#ff4c2b", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#ff1212", "t", "t", "#ff1212", "#ffeb3b", "#ffeb3b", "#ff4c2b", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#ff1212", "#ff1212", "#ff1212", "#ff1212", "#ffeb3b", "#fffef2", "#fffef2", "#ff4c2b", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#ff1212", "#ff1212", "#ff1212", "#ff4c2b", "#ffeb3b", "#ffeb3b", "#ff4c2b", "#fffef2", "#fffef2", "#ffeb3b", "#000000", "#000000", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#ff1212", "#ff4c2b", "#ff4c2b", "#ffeb3b", "#ffeb3b", "#ff4c2b", "#ffeb3b", "#fffef2", "#000000", "#515151", "#4d4d4d", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#ff1212", "#ff4c2b", "#ffeb3b", "#ff4c2b", "#ff4c2b", "#ffeb3b", "#fffef2", "#fffef2", "#000000", "#414141", "#434343", "#2d2d2d", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#ff1212", "#ff4c2b", "#ffeb3b", "#ffeb3b", "#ffeb3b", "#fffef2", "#000000", "#525252", "#636363", "#404040", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#ff1212", "#ff4c2b", "#ffeb3b", "#fffef2", "#fffef2", "#000000", "#404040", "#333333", "#4f4f4f", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#ffeb3b", "#fffef2", "#000000", "#4c4c4c", "#2c2c2c", "#5d5d5d", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#000000", "#000000", "t", "t", "#ffeb3b", "#000000", "#575757", "#353535", "#4b4b4b", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#000000", "#575757", "#000000", "t", "#000000", "#575757", "#494949", "#292929", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#000000", "#4b4b4b", "#000000", "#303030", "#333333", "#292929", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#000000", "#4c4c4c", "#000000", "#030303", "#2f2f2f", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#000000", "#4396d9", "#000000", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#693e10", "#4a2c0b", "#000000", "#363636", "#444444", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#693e10", "#4a2c0b", "#693e10", "t", "#000000", "#000000", "#3d3d3d", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#000000", "#000000", "#4a2c0b", "#693e10", "t", "t", "t", "t", "#000000", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#000000", "#3c86c2", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "#000000", "#000000", "#000000", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t", "t"];
editor.general.loadFromJSON(sword);