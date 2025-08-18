
import PersonTable;

struct table Add extends PersonTable{

    age?:int(11)

    pwd:range(6,16)
    email?:email(128)

    /**
    * @param name varchar
    * @Optional
    */
    name:varchar(255)
     id:int(8)
      PRIMARY KEY(id)
}