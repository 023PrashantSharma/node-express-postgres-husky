/**
 * patient.js
 * @description :: sequelize model of database table patient
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConnection');
const sequelizePaginate = require('sequelize-paginate');
const sequelizeTransforms = require('sequelize-transforms');
const dayjs = require('dayjs');
const { convertObjectToEnum } = require('../utils/common');
let Patient = sequelize.define('patient',{
  id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  name:{ type:DataTypes.STRING },
  code:{
    type:DataTypes.STRING,
    unique:true,
    lowercase:false,
    primaryKey:false,
    allowNull:true
  },
  email:{ type:DataTypes.STRING },
  isActive:{
    type:DataTypes.BOOLEAN,
    defaultValue:true
  },
  createdAt:{
    type:DataTypes.DATE,
    defaultValue:'on create currentTime'
  },
  updatedAt:{
    type:DataTypes.DATE,
    defaultValue:'on update currentTime'
  },
  addedBy:{ type:DataTypes.INTEGER },
  updatedBy:{ type:DataTypes.INTEGER },
  isDeleted:{
    type:DataTypes.BOOLEAN,
    defaultValue:false
  }
}
,{
  hooks:{
    beforeCreate: [
      async function (patient,options){
        patient.isActive = true;
        patient.isDeleted = false;

      },
    ],
    beforeBulkCreate: [
      async function (patient,options){
        if (patient !== undefined && patient.length) { 
          for (let index = 0; index < patient.length; index++) { 
        
            const element = patient[index]; 
            element.isActive = true; 
            element.isDeleted = false; 
  
          } 
        }
      },
    ],
  }
}
);
Patient.prototype.toJSON = function () {
  let values = Object.assign({}, this.get());
  values.createdAt = dayjs(values.createdAt).format('MMM D, YYYY h A');
  values.updatedAt = dayjs(values.updatedAt).format('MMM D, YYYY h A');
  return values;
};
sequelizeTransforms(Patient);
sequelizePaginate.paginate(Patient);
module.exports = Patient;
