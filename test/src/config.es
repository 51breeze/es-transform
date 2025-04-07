import System;
import * as Conf1 from 'config2.es';

import com.Person;

import com.TestInterface;

System.setConfig('ssss', 222)


const config = {};

config.env = 'prod';


new Person()

console.log( TestInterface , com.TestInterface2)


export var name = 'php';


export default config;


export {name as child_name} from 'config_child';

export * as child_config from 'config_child';

export * from 'config_child';