import { getBuilder } from '../core/TableBuilder';
export default function(ctx, stack){
    getBuilder('mysql').createTable(ctx, stack)
}