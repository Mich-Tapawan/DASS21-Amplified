from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from scripts.model import DASSModel

app = Flask(__name__)
CORS(app)

DASS_model = DASSModel()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/test')
def test():
    return render_template('test.html')

@app.route('/info')
def info():
    return render_template('info.html')

@app.route('/computeDASS', methods=['POST'])
def compute_dass():
    data = request.get_json()
    DASS_model.load_model()
    res = DASS_model.predict(data['dAnswers'],data['aAnswers'],data['sAnswers'])
    return res

if __name__ == "__main__":
    app.run(debug=True)
