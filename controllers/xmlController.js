const { validationResult } = require('express-validator');
var convert = require('xml-js')

const db = require('../config/dbConn');

const xmlParseController = (req, res) => {
    const err = validationResult(req)

    console.log("IN controller")
    if (!err.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    var result = convert.xml2json(req.body.xmlVal, { compact: true, spaces: 4 });



    console.log("RES 1", result)
    let fn = JSON.parse(result).person.first_name._text;
    let ln = JSON.parse(result).person.last_name._text;
    let add = JSON.parse(result).person.address._text;
    let pinCode = JSON.parse(result).person.pincode._text;
    let mobNo = JSON.parse(result).person.mobile_number._text;
    let uid = JSON.parse(result).person.uid._text;
    let orn = JSON.parse(result).person.orn._text;
    let bucket = JSON.parse(result).person.bucket._text;
    let uXml = JSON.stringify(req.body.xmlVal);
    let uJson = JSON.stringify(result);
    console.log("DATA", Date.now())
    // let time = JSON.stringify(Date.now())

    const date = new Date();
const time = JSON.stringify(date.toLocaleDateString('en-US', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
}));

console.log(time);

    let mobNoList = []
    let ornList = []
    let uidList = []


    db.query(`SELECT mobile_number,orn,uid FROM xmlparsetable;`, (error, results, fields) => {
        if (error) {
            console.log('ERROR WHILE EXECUTING mobile_number Query');
            return;
        }

        // Extract mobile_number values from the query results
        mobNoList = results.map((row) => row.mobile_number);
        ornList = results.map((row) => row.orn);
        uidList = results.map((row) => row.uid);



        console.log("Mobile Number list:", mobNoList);
        console.log("orn list:", ornList);
        console.log("uid list:", uidList);
        if (ornList.includes(orn)) {
            db.query(`INSERT INTO audit_table (instance_id,status,timestamp) VALUES ('0','Parse Fail ORN - ${orn} Already Exists','${time}');`),
                        (err, res) => {
                            if (!err) {
                                console.log("Logged Success")
                            }
                        }
            return res.status(400).send({
                msg: 'ORN Already Exists'
            })
        } else if (uidList.includes(uid)) {
            db.query(`INSERT INTO audit_table (instance_id,status,timestamp) VALUES ('0','Parse Fail UID - ${uid} Already Exists','${time}');`),
            (err, res) => {
                if (!err) {
                    console.log("Logged Success")
                }
            }
            return res.status(400).send({
                msg: 'UID Already Exists'
            })
        } else if (mobNoList.includes(mobNo)) {
            db.query(`INSERT INTO audit_table (instance_id,status,timestamp) VALUES ('0','Parse Fail MobNo - ${mobNo} Already Exists','${time}');`),
            (err, res) => {
                if (!err) {
                    console.log("Logged Success")
                }
            }
            return res.status(400).send({
                msg: 'Mob No Already exists'
            })
        } else {
            db.query(
                `INSERT INTO xmlparsetable (first_name,last_name,address,pincode,mobile_number,uid,orn,bucket,user_xml,user_json,created_at) VALUES ('${fn}','${ln}','${add}','${pinCode}','${mobNo}','${uid}','${orn}','${bucket}',${uXml},${uJson},${time});`,
                (err, insertresult) => {
                    console.log("result ***", insertresult)
                    if (err) {

                        return insertresult.status(500).send({
                            msg: err
                        })
                    }

                    db.query(`INSERT INTO audit_table (instance_id,status,timestamp) VALUES ('${insertresult.insertId}','XML Parse Success for Instance ID - ${insertresult.insertId}','${time}');`),
                        (err, res) => {
                            if (!err) {
                                console.log("Logged Success")
                            }
                        }

                    return res.status(201).send({
                        msg: 'XML parsed Successfully.'
                    })
                }
            )
        }



    });







}




module.exports = {
    xmlParseController
}