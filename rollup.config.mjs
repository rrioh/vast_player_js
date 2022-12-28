import { defineConfig } from "rollup";
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
    input: "src/main.ts",
    output: {
        file: "dist/vast_player.js",
        format: "iife"
    },
    plugins: [
        typescript()
    ]
});
