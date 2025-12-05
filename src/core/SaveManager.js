export class SaveManager {

    serializegameMetrics(gameMetrics) {
        // Récupérer toutes les métriques du jeu
        const metrics = gameMetrics.getAllMetrics();
        // Transformer en JSON
        const json = JSON.stringify(metrics);
        console.log(json);
        // Transformer en base64 pour stockage plus sûr
        const base64 = btoa(json);
        // Transformer en binary pour stockage en fichier
        const binary = new Uint8Array(base64.length);
        for (let i = 0; i < base64.length; i++) {
            binary[i] = base64.charCodeAt(i);
        }
        return binary;

    }

    deserializegameMetrics(binary, gameMetrics) {
        // Transformer le binaire en base64
        let base64 = '';
        for (let i = 0; i < binary.length; i++) {
            base64 += String.fromCharCode(binary[i]);
        }
        // Transformer le base64 en JSON
        const json = atob(base64);
        console.log(json);
        // Transformer le JSON en objet
        const metrics = JSON.parse(json);
        return metrics;
    }
}