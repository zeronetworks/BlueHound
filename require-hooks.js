// ability to require/import TypeScript files
require('ts-node').register({
    typeCheck: false, // faster, no type checking when require'ing files. Use another process to do actual type checking.
    transpileOnly: true, // no type checking, just strip types and output JS.
    files: true,

    // manually supply our own compilerOptions, otherwise if we run this file
    // from another project's location then ts-node will use
    // the compilerOptions from that other location, which may not work.
    compilerOptions: require('./tsconfig.json').compilerOptions,
})