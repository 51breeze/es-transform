import System;
import * as Conf1 from 'config2.es';

import com.Person;

import com.TestInterface;

System.setConfig('ssss', 222)


const config = {};

config.env = 'prod';


new Person()

console.log( TestInterface , com.TestInterface2)

//这里是应用配置
export const imgHost = 'http://127.0.0.1:8090/img';


export var name = 'php';


export default config;


export {name as child_name} from 'config_child';

export * as child_config from 'config_child';

export * from 'config_child';