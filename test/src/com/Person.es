
package com
{
    import style  from 'assets/style.css';
    
    public class Person
    {
        @Embed('assets/style.css')
        private styles;

        constructor(){
           this.hasOwnProperty("name");
        }

        @Post
        list(){
            return [];
        }
    }
}
