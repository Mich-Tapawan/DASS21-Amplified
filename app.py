from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from scripts.nlp import analyze_dass21_symptoms
from scripts.model import DASSModel

app = Flask(__name__)
CORS(app)

DASS_model = DASSModel()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/detect')
def detect():
    return render_template('nlp.html')

@app.route('/info')
def info():
    return render_template('info.html')

MAX_TEXT_LEN = 2000

@app.route('/processText', methods=['POST'])
def processText():
    try:
        data = request.get_json(silent=True) or {}
        text = data.get('text')

        if text is None or not str(text).strip():
            return jsonify({'error': 'Text is required.'}), 400

        text = str(text).strip()
        if len(text) > MAX_TEXT_LEN:
            return jsonify({
                'error': f'Text must be at most {MAX_TEXT_LEN} characters.'
            }), 400

        response = analyze_dass21_symptoms(text)
        return jsonify(response)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/computeDASS', methods=['POST'])
def compute_dass():
    data = request.get_json()
    DASS_model.load_model()
    res = DASS_model.predict(data['dAnswers'],data['aAnswers'],data['sAnswers'])
    return res

if __name__ == "__main__":
    app.run(debug=True)