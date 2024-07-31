/**
 * Plan.js
 * @description :: sequelize model of database table Plan
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConnection');
const sequelizePaginate = require('sequelize-paginate');
const sequelizeTransforms = require('sequelize-transforms');
const dayjs = require('dayjs');
const { convertObjectToEnum } = require('../utils/common');
let Plan = sequelize.define('Plan',{
  id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  name:{ type:DataTypes.STRING },
  decription:{ type:DataTypes.STRING },
  code:{ type:DataTypes.STRING },
  validityInDays:{ type:DataTypes.STRING },
  minimumUser:{ type:DataTypes.INTEGER },
  maximumUser:{ type:DataTypes.INTEGER },
  perUserAmount:{ type:DataTypes.INTEGER },
  markup:{ type:DataTypes.INTEGER },
  discount:{ type:DataTypes.INTEGER },
  validFrom:{ type:DataTypes.DATE },
  validTo:{ type:DataTypes.DATE },
  isActive:{ type:DataTypes.BOOLEAN },
  createdAt:{ type:DataTypes.DATE },
  updatedAt:{ type:DataTypes.DATE },
  updatedBy:{ type:DataTypes.INTEGER },
  addedBy:{ type:DataTypes.INTEGER },
  isDeleted:{ type:DataTypes.BOOLEAN }
}
,{
  hooks:{
    beforeCreate: [
      async function (Plan,options){
        Plan.isActive = true;
        Plan.isDeleted = false;

      },
    ],
    beforeBulkCreate: [
      async function (Plan,options){
        if (Plan !== undefined && Plan.length) { 
          for (let index = 0; index < Plan.length; index++) { 
        
            const element = Plan[index]; 
            element.isActive = true; 
            element.isDeleted = false; 
  
          } 
        }
      },
    ],
  }
}
);
Plan.prototype.toJSON = function () {
  let values = Object.assign({}, this.get());
  values.validFrom = dayjs(values.validFrom).format('MMM D, YYYY h A');
  values.validTo = dayjs(values.validTo).format('MMM D, YYYY h A');
  values.createdAt = dayjs(values.createdAt).format('MMM D, YYYY h A');
  values.updatedAt = dayjs(values.updatedAt).format('MMM D, YYYY h A');
  return values;
};
sequelizeTransforms(Plan);
sequelizePaginate.paginate(Plan);
module.exports = Plan;
