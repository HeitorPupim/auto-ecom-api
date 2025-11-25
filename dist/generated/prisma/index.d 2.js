"use strict";
/**
 * Client
**/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prisma = exports.PrismaClient = void 0;
const runtime = __importStar(require("./runtime/library.js"));
/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
class PrismaClient {
    /**
 * `prisma.user`: Exposes CRUD operations for the **User** model.
  * Example usage:
  * ```ts
  * // Fetch zero or more Users
  * const users = await prisma.user.findMany()
  * ```
  */
    get user() { }
}
exports.PrismaClient = PrismaClient;
var Prisma;
(function (Prisma) {
    Prisma.DMMF = runtime.DMMF;
    /**
     * Validator
     */
    Prisma.validator = runtime.Public.validator;
    /**
     * Prisma Errors
     */
    Prisma.PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
    Prisma.PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
    Prisma.PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
    Prisma.PrismaClientInitializationError = runtime.PrismaClientInitializationError;
    Prisma.PrismaClientValidationError = runtime.PrismaClientValidationError;
    Prisma.NotFoundError = runtime.NotFoundError;
    /**
     * Re-export of sql-template-tag
     */
    Prisma.sql = runtime.sqltag;
    Prisma.empty = runtime.empty;
    Prisma.join = runtime.join;
    Prisma.raw = runtime.raw;
    Prisma.Sql = runtime.Sql;
    /**
     * Decimal.js
     */
    Prisma.Decimal = runtime.Decimal;
    Prisma.getExtensionContext = runtime.Extensions.getExtensionContext;
    /**
     * Types of the values used to represent different kinds of `null` values when working with JSON fields.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    let NullTypes;
    (function (NullTypes) {
        /**
        * Type of `Prisma.DbNull`.
        *
        * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
        *
        * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
        */
        class DbNull {
        }
        /**
        * Type of `Prisma.JsonNull`.
        *
        * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
        *
        * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
        */
        class JsonNull {
        }
        /**
        * Type of `Prisma.AnyNull`.
        *
        * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
        *
        * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
        */
        class AnyNull {
        }
    })(NullTypes || (NullTypes = {}));
})(Prisma || (exports.Prisma = Prisma = {}));
