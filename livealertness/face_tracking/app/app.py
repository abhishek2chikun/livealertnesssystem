import flask 
from flaskext.mysql import MySQL
from flask_cors import CORS, cross_origin
import yaml
from flask import request

app =flask.Flask(__name__)

db = yaml.load(open('db.yaml'))
#Configure DBpi
app.config['MYSQL_DATABASE_HOST'] = db['mysql_host']
app.config['MYSQL_DATABASE_USER'] = db['mysql_user']
app.config['MYSQL_DATABASE_PASSWORD'] = db['mysql_password']
app.config['MYSQL_DATABASE_DB'] = db['mysqldb']

mysql = MySQL()
mysql.init_app(app)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/')
def Home():
	return "<h1>Hello<h1>"
@cross_origin
@app.route('/position',methods=['GET', 'POST'])
def Position():
	if request.method == 'POST':
		Data = request.json
		print(Data)
		try:
			#Data = request.args
			SID = Data['SID']
			Position = (Data['Position'])
			Threshold = (Data['Threshold'])
			Faces = Data['Faces']

			con = mysql.connect()
			cur =con.cursor()
			#print("INSERT INTO position_(sid,position,cordinates) VALUES({0},'{1}','{2}')".format(SID,Position,Cordinates))
			try:
				cur.execute("INSERT INTO position_(sid,position,Threshold,Faces) VALUES(%s,%s,%s,%s)",(SID,Position,Threshold,Faces))
			except Exception as e:
				print(e)
				return f"{e}"
			cur.connection.commit()
			cur.close()
		except Exception as e:
			print("Failed:",e)

		return "Done"

@cross_origin
@app.route('/emotion',methods=['GET', 'POST'])
def Emotion():
	if request.method == 'POST':
		Data = request.json
		print(Data)
		try:
			#Data = request.args
			SID = Data['SID']
			Expression = (Data['Expression'])
			


			con = mysql.connect()
			cur =con.cursor()
			#print("INSERT INTO position_(sid,position,cordinates) VALUES({0},'{1}','{2}')".format(SID,Position,Cordinates))
			try:
				cur.execute("INSERT INTO Emotion_(sid,Expression) VALUES(%s,%s)",(SID,Expression))
			except Exception as e:
				print(e)
				return f"{e}"
			cur.connection.commit()
			cur.close()
		except Exception as e:
			print("Failed:",e)

		return "Done"

if __name__ == '__main__':
	app.run(debug=True)