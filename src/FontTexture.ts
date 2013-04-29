/// <reference path="../../phaser/Phaser/Game.ts" />

module Phaser {

    export class FontTexture extends GameObject{
        indices = [];
        firstChar: number = 32;
        alpha: number = 1;
        letterSpacing: number = 1;
        lineSpacing: number = 0;
        offsetCache: Point[] = [];
        private _texture;
        atlasData: JSON;
        atlasCache = {};
        widthMap = {};
        spaceWidth: number = 0;
        constructor(game: Game, x: number = 0, y: number = 0, key: string = null, kerning : number = 0,spaceWidth: number = 0) {
            //super(src);
            super(game, x, y);
            console.log("works");
            this._texture = null;
            this.letterSpacing = kerning;
            this.spaceWidth = spaceWidth;
            if (key !== null) {
                this.loadGraphic(key);
            }
            else {
                this.bounds.width = 16;
                this.bounds.height = 16;
            }
        }

        public loadGraphic(key: string): FontTexture {
            console.log("load graphics", key);
            if (this._game.cache.getImage(key) !== null) {
                this._texture = this._game.cache.getImage(key);
                this.loadFrameData(this._game.cache.getText(key+"-atlas"));
                
            }

            return this;

        }

        loadFrameData(data: string) {

            this.atlasData = JSON.parse(data);
            

            this.height = (<any>this.atlasData).meta.lineHeight;
            this.letterSpacing = Number((<any>this.atlasData).meta.kerning);
            this.spaceWidth = Number((<any>this.atlasData).meta.spaceWidth);

            this.atlasCache = {};
            this.widthMap = {};
            var total: number = this.atlasData["frames"].length;

            console.log("parse frame data", Number((<any>this.atlasData).meta.kerning), Number((<any>this.atlasData).meta.spaceWidth));

        }

        
        _drawChar(c, targetX, targetY) {
            if (c == 0)
                return this.spaceWidth + this.letterSpacing;

            var rect = this.getSpriteRect(c + this.firstChar);
            this.draw(targetX + rect["offsetX"], targetY + rect["offsetY"], c + this.firstChar);
            return rect.width + this.letterSpacing;
        }

        getSpriteRect(spriteId): Rectangle {
            //TODO this could be better, I douplicated it from the TextureAtlas just to add the offset x/y for fonts

            //Return from cache if possible
            if (typeof this.atlasCache[spriteId] != "undefined") {
                return this.atlasCache[spriteId];
                console.log(spriteId, "is cached");
            }


            // Search for the frame data and cache
            for (var i = 0; i < this.atlasData["frames"].length; i++) {
                if (this.atlasData["frames"][i].filename == spriteId) {

                    var frame = this.atlasData["frames"][i].frame;

                    var rect: Rectangle = new Rectangle(frame.x, frame.y, frame.w, frame.h);
                    (<any>rect).offsetX = frame.sx;
                    (<any>rect).offsetY = frame.sy;
                    this.atlasCache[spriteId] = rect;

                    //this.atlasCache[spriteId] = new Rectangle(frame.x, frame.y, frame.w, frame.h);

                    //console.log("spriteId", this.atlasCache[spriteId]);
                    return this.atlasCache[spriteId];
                }
            }

            //console.log(spriteId, "not cached");
            return new Rectangle();
            throw ('TextureAtlas Exception: frame [' + spriteId + '] does not exist!');
        }


        widthForString(text) {
            // Multiline?
            if (text.indexOf('\n') !== -1) {
                var lines = text.split('\n');
                var width = 0;
                for (var i = 0; i < lines.length; i++) {
                    width = Math.max(width, this._widthForLine(lines[i]));
                }
                return width;
            }
            else {
                return this._widthForLine(text);
            }
        }


        _widthForLine(text) {
            var width = 0;
            for (var i = 0; i < text.length; i++) {
                width += this.getSpriteRect([text.charCodeAt(i) - this.firstChar]).width + this.letterSpacing;
            }
            return width;
        }

        heightForString(text) {
            return text.split('\n').length * (this.height + this.lineSpacing);
        }

        drawText(text, x, y, align) {
            if (typeof (text) != 'string') {
                text = text.toString();
            }

            // Multiline?
            if (text.indexOf('\n') !== -1) {
                var lines = text.split('\n');
                var lineHeight = this.height + this.lineSpacing;
                for (var i = 0; i < lines.length; i++) {
                    this.drawText(lines[i], x, y + i * lineHeight, align);
                }
                return;
            }

            if (align == ALIGN.RIGHT || align == ALIGN.CENTER) {
                var width = this._widthForLine(text);
                x -= align == ALIGN.CENTER ? width / 2 : width;
            }


            if (this.alpha !== 1) {
                this._game.stage.context.globalAlpha = this.alpha;
            }

            for (var i = 0; i < text.length; i++) {
                var c = text.charCodeAt(i);
                x += this._drawChar(c - this.firstChar, x, y);
            }

            if (this.alpha !== 1) {
                this._game.stage.context.globalAlpha = 1;
            }
        }

        public render(camera: Camera, cameraOffsetX: number, cameraOffsetY: number): bool {
            return false;
        }

        draw(targetX?: number, targetY?: number, spriteID?: string) {

            var rect = this.getSpriteRect(spriteID);

            this._game.stage.context.drawImage(
                this._texture,
                rect.x,
                rect.y,
                rect.width,
                rect.height,
                targetX,//Game.system.getDrawPos(targetX) * scaleX - (flipX ? rect.width : 0),
                targetY,//Game.system.getDrawPos(targetY) * scaleY - (flipY ? rect.height : 0),
                rect.width,
                rect.height
            );

        }
        
    }

    export var ALIGN = {
        LEFT: 0,
        RIGHT: 1,
        CENTER: 2
    };
}