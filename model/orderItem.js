/**
 * orderItem.js
 * @description :: sequelize model of database table orderItem
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConnection');
const sequelizePaginate = require('sequelize-paginate');
const sequelizeTransforms = require('sequelize-transforms');
const dayjs = require('dayjs');
const { convertObjectToEnum } = require('../utils/common');
let OrderItem = sequelize.define('orderItem',{
  id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  orderId:{ type:DataTypes.STRING },
  item:{ type:DataTypes.STRING },
  uom:{ type:DataTypes.STRING },
  qty:{ type:DataTypes.INTEGER },
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
      async function (orderItem,options){
        orderItem.isActive = true;
        orderItem.isDeleted = false;

      },
    ],
    beforeBulkCreate: [
      async function (orderItem,options){
        if (orderItem !== undefined && orderItem.length) { 
          for (let index = 0; index < orderItem.length; index++) { 
        
            const element = orderItem[index]; 
            element.isActive = true; 
            element.isDeleted = false; 
  
          } 
        }
      },
    ],
  }
}
);
OrderItem.prototype.toJSON = function () {
  let values = Object.assign({}, this.get());
  values.createdAt = dayjs(values.createdAt).format('MMM D, YYYY h A');
  values.updatedAt = dayjs(values.updatedAt).format('MMM D, YYYY h A');
  return values;
};
sequelizeTransforms(OrderItem);
sequelizePaginate.paginate(OrderItem);
module.exports = OrderItem;
