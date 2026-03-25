import { fetchGemini } from './src/services/gemini.js';

async function test() {
    try {
        console.log('Sending API call...');
        const text = await fetchGemini('Salut', 'Ești un asistent amabil.');
        console.log('RESPONSE:', text);
    } catch(e) {
        console.error('ERROR:', e);
    }
}
test();
