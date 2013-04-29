var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../phaser/Phaser/Game.ts" />
var Phaser;
(function (Phaser) {
    var FontTexture = (function (_super) {
        __extends(FontTexture, _super);
        function FontTexture(game, x, y, key, kerning, spaceWidth) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            if (typeof key === "undefined") { key = null; }
            if (typeof kerning === "undefined") { kerning = 0; }
            if (typeof spaceWidth === "undefined") { spaceWidth = 0; }
            //super(src);
                _super.call(this, game, x, y);
            this.indices = [];
            this.firstChar = 32;
            this.alpha = 1;
            this.letterSpacing = 1;
            this.lineSpacing = 0;
            this.offsetCache = [];
            this.atlasCache = {
            };
            this.widthMap = {
            };
            this.spaceWidth = 0;
            console.log("works");
            this._texture = null;
            this.letterSpacing = kerning;
            this.spaceWidth = spaceWidth;
            if(key !== null) {
                this.loadGraphic(key);
            } else {
                this.bounds.width = 16;
                this.bounds.height = 16;
            }
        }
        FontTexture.prototype.loadGraphic = function (key) {
            console.log("load graphics", key);
            if(this._game.cache.getImage(key) !== null) {
                this._texture = this._game.cache.getImage(key);
                this.loadFrameData(this._game.cache.getText(key + "-atlas"));
            }
            return this;
        };
        FontTexture.prototype.loadFrameData = function (data) {
            this.atlasData = JSON.parse(data);
            this.height = (this.atlasData).meta.lineHeight;
            this.letterSpacing = Number((this.atlasData).meta.kerning);
            this.spaceWidth = Number((this.atlasData).meta.spaceWidth);
            this.atlasCache = {
            };
            this.widthMap = {
            };
            var total = this.atlasData["frames"].length;
            console.log("parse frame data", Number((this.atlasData).meta.kerning), Number((this.atlasData).meta.spaceWidth));
        };
        FontTexture.prototype._drawChar = function (c, targetX, targetY) {
            if(c == 0) {
                return this.spaceWidth + this.letterSpacing;
            }
            var rect = this.getSpriteRect(c + this.firstChar);
            this.draw(targetX + rect["offsetX"], targetY + rect["offsetY"], c + this.firstChar);
            return rect.width + this.letterSpacing;
        };
        FontTexture.prototype.getSpriteRect = function (spriteId) {
            //TODO this could be better, I douplicated it from the TextureAtlas just to add the offset x/y for fonts
            //Return from cache if possible
            if(typeof this.atlasCache[spriteId] != "undefined") {
                return this.atlasCache[spriteId];
                console.log(spriteId, "is cached");
            }
            // Search for the frame data and cache
            for(var i = 0; i < this.atlasData["frames"].length; i++) {
                if(this.atlasData["frames"][i].filename == spriteId) {
                    var frame = this.atlasData["frames"][i].frame;
                    var rect = new Phaser.Rectangle(frame.x, frame.y, frame.w, frame.h);
                    (rect).offsetX = frame.sx;
                    (rect).offsetY = frame.sy;
                    this.atlasCache[spriteId] = rect;
                    //this.atlasCache[spriteId] = new Rectangle(frame.x, frame.y, frame.w, frame.h);
                    //console.log("spriteId", this.atlasCache[spriteId]);
                    return this.atlasCache[spriteId];
                }
            }
            //console.log(spriteId, "not cached");
            return new Phaser.Rectangle();
            throw ('TextureAtlas Exception: frame [' + spriteId + '] does not exist!');
        };
        FontTexture.prototype.widthForString = function (text) {
            // Multiline?
            if(text.indexOf('\n') !== -1) {
                var lines = text.split('\n');
                var width = 0;
                for(var i = 0; i < lines.length; i++) {
                    width = Math.max(width, this._widthForLine(lines[i]));
                }
                return width;
            } else {
                return this._widthForLine(text);
            }
        };
        FontTexture.prototype._widthForLine = function (text) {
            var width = 0;
            for(var i = 0; i < text.length; i++) {
                width += this.getSpriteRect([
                    text.charCodeAt(i) - this.firstChar
                ]).width + this.letterSpacing;
            }
            return width;
        };
        FontTexture.prototype.heightForString = function (text) {
            return text.split('\n').length * (this.height + this.lineSpacing);
        };
        FontTexture.prototype.drawText = function (text, x, y, align) {
            if(typeof (text) != 'string') {
                text = text.toString();
            }
            // Multiline?
            if(text.indexOf('\n') !== -1) {
                var lines = text.split('\n');
                var lineHeight = this.height + this.lineSpacing;
                for(var i = 0; i < lines.length; i++) {
                    this.drawText(lines[i], x, y + i * lineHeight, align);
                }
                return;
            }
            if(align == Phaser.ALIGN.RIGHT || align == Phaser.ALIGN.CENTER) {
                var width = this._widthForLine(text);
                x -= align == Phaser.ALIGN.CENTER ? width / 2 : width;
            }
            if(this.alpha !== 1) {
                this._game.stage.context.globalAlpha = this.alpha;
            }
            for(var i = 0; i < text.length; i++) {
                var c = text.charCodeAt(i);
                x += this._drawChar(c - this.firstChar, x, y);
            }
            if(this.alpha !== 1) {
                this._game.stage.context.globalAlpha = 1;
            }
        };
        FontTexture.prototype.render = function (camera, cameraOffsetX, cameraOffsetY) {
            return false;
        };
        FontTexture.prototype.draw = function (targetX, targetY, spriteID) {
            var rect = this.getSpriteRect(spriteID);
            this._game.stage.context.drawImage(this._texture, rect.x, rect.y, rect.width, rect.height, targetX, //Game.system.getDrawPos(targetX) * scaleX - (flipX ? rect.width : 0),
            targetY, //Game.system.getDrawPos(targetY) * scaleY - (flipY ? rect.height : 0),
            rect.width, rect.height);
        };
        return FontTexture;
    })(Phaser.GameObject);
    Phaser.FontTexture = FontTexture;    
    Phaser.ALIGN = {
        LEFT: 0,
        RIGHT: 1,
        CENTER: 2
    };
})(Phaser || (Phaser = {}));
