import {  map } from 'ramda';
import * as L from '../imp/L3-ast';
import { LitExp, ProcExp, Program, VarDecl } from '../imp/L3-ast';
import { EmptySExp, isCompoundSExp, isSymbolSExp, valueToString } from '../imp/L3-value';
import { Result, makeOk} from '../shared/result';
import { Exp } from './L31-ast';


export const isEmptySExp = (x: any): x is EmptySExp => x.tag === "EmptySExp";

const unparseLitExp = (le: LitExp): string =>
    isEmptySExp(le.val) ? `'()` :
    isSymbolSExp(le.val) ? `'${valueToString(le.val)}` :
    isCompoundSExp(le.val) ? `'${valueToString(le.val)}` :
    `${le.val}`;

const unparseLExps = (les: Exp[]): string =>
    map(unparseL2, les).join("\n");

const unparseProcExp = (pe: ProcExp): string => 
    `(lambda ${map((p: VarDecl) => p.var, pe.args).join(",")} : ${unparseLExps(pe.body)})`

const unparseLetExp = (le: L.LetExp) : string => 
    `(let (${map((b: L.Binding) => `(${b.var.var} ${unparseL2(b.val)})`, le.bindings).join(" ")}) ${unparseLExps(le.body)})`

const unpraseAppExp = (exp:L.AppExp):string =>{
     //console.log(exp.rator);
     return unparseL2(exp.rator) === '=' ? `(${map(unparseL2 ,exp.rands).join(" == ")})` :
        unparseL2(exp.rator) === 'not' ? `(not ${unparseL2(exp.rands[0])})` :
     L.isProcExp(exp.rator) || L.isVarRef(exp.rator) ? `${unparseL2(exp.rator)}(${map(unparseL2 ,exp.rands).join(",")})` :
     `(${map(unparseL2 ,exp.rands).join(" " + unparseL2(exp.rator) +" ")})`
}


export const unparseL2 = (exp: Program | Exp): string =>
    L.isBoolExp(exp) ? valueToString(exp.val) :
    L.isNumExp(exp) ? valueToString(exp.val) :
    L.isStrExp(exp) ? valueToString(exp.val) :
    L.isLitExp(exp) ? unparseLitExp(exp) :
    L.isVarRef(exp) ? exp.var :
    L.isProcExp(exp) ? unparseProcExp(exp) :
    L.isIfExp(exp) ? `(${unparseL2(exp.then)} if ${unparseL2(exp.test)} else ${unparseL2(exp.alt)})` :
    L.isAppExp(exp) ? unpraseAppExp(exp) :
    L.isPrimOp(exp) ? exp.op :
    L.isLetExp(exp) ? unparseLetExp(exp) :
    L.isDefineExp(exp) ? `${exp.var.var} = ${unparseL2(exp.val)}` :
    L.isProgram(exp) ? `${unparseLExps(exp.exps)}` :
    exp;



export const l2ToPython = (exp: Exp | Program): Result<string>  => {
    return makeOk(unparseL2(exp))
}
    
    
    








