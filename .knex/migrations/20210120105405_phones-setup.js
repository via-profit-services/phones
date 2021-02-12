module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 57:
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.down = exports.up = void 0;
function up(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.raw(`

    DROP TABLE IF EXISTS "phonesTypes";
    CREATE TABLE "phonesTypes" (
      "type" varchar(50) NOT NULL,
      CONSTRAINT "phonesTypes_un" UNIQUE (type)
    );

    DROP TABLE IF EXISTS "phones";
    CREATE TABLE "phones" (
      "id" uuid NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "entity" uuid NOT NULL,
      "type" varchar(50) NOT NULL DEFAULT 'VoidPhoneEntity'::character varying,
      "country" varchar(4) NOT NULL,
      "number" varchar(20) NOT NULL,
      "metaData" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "confirmed" boolean NOT NULL DEFAULT false,
      "primary" boolean NOT NULL DEFAULT true,
      "description" text default NULL,
      CONSTRAINT phones_pkey PRIMARY KEY (id)
    );
 
    ALTER TABLE "phones" ADD CONSTRAINT phones_type_fk FOREIGN KEY (type) REFERENCES "phonesTypes"(type) ON DELETE CASCADE;
    CREATE INDEX "phonesEntityIndex" ON phones USING btree (entity);
  `);
    });
}
exports.up = up;
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.raw(`
    DROP TABLE IF EXISTS "phones" CASCADE;
    DROP TABLE IF EXISTS "phonesTypes" CASCADE;
  `);
    });
}
exports.down = down;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(57);
/******/ })()
;