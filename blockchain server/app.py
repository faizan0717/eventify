import hashlib
import json
from time import time
from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

class Blockchain:
    def __init__(self):
        self.chain = []
        self.current_transactions = []
        self.create_table()

        # Create the genesis block
        self.new_block(previous_hash='1', proof=100)

    def create_table(self):
        conn = sqlite3.connect('blockchain.db')
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS transactions (
                          id TEXT
                          )''')
        conn.commit()
        conn.close()

    def new_block(self, proof, previous_hash=None):
        """
        Create a new Block in the Blockchain
        :param proof: <int> The proof given by the Proof of Work algorithm
        :param previous_hash: (Optional) <str> Hash of previous Block
        :return: <dict> New Block
        """
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time(),
            'transactions': self.current_transactions,
            'proof': proof,
            'previous_hash': previous_hash or self.hash(self.chain[-1]),
        }

        # Reset the current list of transactions
        self.current_transactions = []

        self.chain.append(block)
        return block

    def new_transaction(self, id):
        """
        Creates a new transaction to store an ID
        :param id: <str> ID to be stored
        :return: <int> The index of the Block that will hold this transaction
        """
        self.current_transactions.append({'id': id})

        # Save the transaction to the SQLite database
        self.save_transaction_to_db(id)

        # After appending the transaction, return the index of the next block
        return self.last_block['index'] + 1

    def save_transaction_to_db(self, id):
        conn = sqlite3.connect('blockchain.db')
        cursor = conn.cursor()
        cursor.execute("INSERT INTO transactions (id) VALUES (?)", (id,))
        conn.commit()
        conn.close()

    @property
    def last_block(self):
        return self.chain[-1]

    @staticmethod
    def hash(block):
        """
        Creates a SHA-256 hash of a Block
        :param block: <dict> Block
        :return: <str>
        """

        # We must make sure that the Dictionary is Ordered, or we'll have inconsistent hashes
        block_string = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

blockchain = Blockchain()

@app.route('/store_id', methods=['POST'])
def store_id():
    data = request.get_json()
    id = data.get('id')
    if id is None:
        return jsonify({'error': 'ID is missing'}), 400

    # Create a new transaction and add it to the blockchain
    index = blockchain.new_transaction(id)
    response = {'message': f'The ID {id} has been stored in block {index}'}
    return jsonify(response), 201

@app.route('/check_id', methods=['POST'])
def check_id():
    data = request.get_json()
    id_to_check = data.get('id')
    if id_to_check is None:
        return jsonify({'error': 'ID is missing'}), 400

    # Establish connection to the SQLite database
    conn = sqlite3.connect('blockchain.db')
    cursor = conn.cursor()

    # Execute SQL query to check if the ID exists in the database
    cursor.execute("SELECT * FROM transactions WHERE id = ?", (id_to_check,))
    result = cursor.fetchone()

    conn.close()

    # Check if the ID exists in the database
    if result:
        return jsonify({'message': 'ID is available'}), 200
    else:
        return jsonify({'message': 'ID is not available'}), 404

if __name__ == '__main__':
    app.run(debug=True)
