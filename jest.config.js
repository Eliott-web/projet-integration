
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    testMatch: [
        '**/tests/**/*.test.ts'
    ],

    setupFiles: ['dotenv/config'],

    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: './server/tsconfig.json'
            }
        ]
    },

    testTimeout: 15000,

    clearMocks: true,
    restoreMocks: true
};
