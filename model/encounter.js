/**
 * encounter.js
 * @description :: sequelize model of database table encounter
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConnection');
const sequelizePaginate = require('sequelize-paginate');
const sequelizeTransforms = require('sequelize-transforms');
const dayjs = require('dayjs');
const { convertObjectToEnum } = require('../utils/common');
let Encounter = sequelize.define('encounter',{
  id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  name:{
    type:DataTypes.STRING,
    unique:false,
    lowercase:false,
    allowNull:false,
    primaryKey:false
  },
  date:{
    type:DataTypes.DATE,
    primaryKey:false
  },
  description:{ type:DataTypes.STRING },
  patientId:{ type:DataTypes.INTEGER },
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
  },
  isActive:{
    type:DataTypes.BOOLEAN,
    defaultValue:true
  }
}
,{
  hooks:{
    beforeCreate: [
      async function (encounter,options){
        encounter.isActive = true;
        encounter.isDeleted = false;

      },
    ],
    beforeBulkCreate: [
      async function (encounter,options){
        if (encounter !== undefined && encounter.length) { 
          for (let index = 0; index < encounter.length; index++) { 
        
            const element = encounter[index]; 
            element.isActive = true; 
            element.isDeleted = false; 
  
          } 
        }
      },
    ],
  }
}
);
Encounter.prototype.toJSON = function () {
  let values = Object.assign({}, this.get());
  values.date = dayjs(values.date).format('MMM D, YYYY h A');
  values.createdAt = dayjs(values.createdAt).format('MMM D, YYYY h A');
  values.updatedAt = dayjs(values.updatedAt).format('MMM D, YYYY h A');
  return values;
};
sequelizeTransforms(Encounter);
sequelizePaginate.paginate(Encounter);
module.exports = Encounter;
