package unit;

import unit.Web;

public class Jsx{

    change(e){

    
    }

    start(){

        return <div id="ssss" xmlns:cmd="@directives" >

            <cmd:if condition="1" >
                <div>the is condition</div>
            </cmd:if>
            <cmd:else>
                <div>the is else</div>
                <div>the is else</div>
            </cmd:else>
           
            <slot:default>
                 <div>test</div>
            </slot:default>

            <div cmd:for="item in []" class="ssss" cmd:if="item===1" on:click={(e)=>e} on:change={this.change}>
                <div style={{}} staticStyle="dssdsdf">{item}</div>
                <div>6666</div>
            </div>    

            <cmd:for name = "{}" item="val" index='index'>
                <div>{val}</div>
                 <div cmd:if="index==1" >999</div>
                 <div cmd:elseif="index==2" >22222</div>
                 <div cmd:else cmd:show="index==3" >888</div>
            </cmd:for>

            <Web />

        </div>

    }
}