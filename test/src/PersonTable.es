
@Define(sql=false)
struct table PersonTable extends DataEntity{
    @Define(order=last)
    createAt?:int(11)
    state?:enum(Types) default Types.enable
    @Define(order=first)
    id:int(11)

}