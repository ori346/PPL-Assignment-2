import { /*ClassExp, ProcExp, */ IfExp, makeAppExp, makeLitExp, makePrimOp, makeVarRef,
     VarDecl,ProcExp,Exp, isClassExp, Binding, Program ,
     makeBinding,CExp,isProgram, makeBoolExp, makeIfExp, makeProcExp,
      makeVarDecl, ClassExp, BoolExp,isBoolExp,isNumExp,isStrExp,isLitExp
      ,isVarRef,isProcExp,isIfExp,isAppExp,isPrimOp,isLetExp,isDefineExp, isCExp, makeDefineExp,
      makeProgram, makeLetExp,LetExp} from "./L31-ast";
import { Result, makeFailure, makeOk } from "../shared/result";
import {  } from "../imp/L3-ast";
import { reduce,slice,map,zipWith } from "ramda";
import { makeSymbolSExp } from "../imp/L3-value";

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/
//export const class2proc = (exp: ClassExp): ProcExp =>
    //@TODO

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/

const rewriteClass = (exp: ClassExp): ProcExp =>{
    const names = map((b:Binding)=>b.var, exp.methods);
    const bodies = map((b:Binding)=>b.val, exp.methods);
    return makeProcExp(exp.fields,[makeProcExp([makeVarDecl("msg")],[methods_to_if(names,bodies)])])
}

const methods_to_if = (names:VarDecl[],bodies:CExp[]):IfExp|BoolExp=>{
    if(names.length==0){return makeBoolExp( false)}
    return makeIfExp(makeAppExp(makePrimOp("eq?"),
    [makeVarRef("msg"),makeLitExp(makeSymbolSExp(names[0].var))]),
    makeAppExp(L31ToL3_cexp(bodies[0]),[]),methods_to_if(names.slice(1),bodies.slice(1)))
}

export const L31ToL3= (exp: Exp | Program): Result<Exp | Program>=>
{
    if(isProgram(exp))
        {
            return makeOk(makeProgram(map(L31ToL3_exp,exp.exps)))
        }
    return makeOk(L31ToL3_exp(exp))
}

const L31ToL3_exp = (exp: Exp ): Exp =>{
    if(isDefineExp(exp))
    {
        return makeDefineExp(exp.var,L31ToL3_cexp(exp.val));
    }
    else
    {
       return L31ToL3_cexp(exp); 
    }
}

const L31ToL3_cexp = (exp: CExp ): CExp =>{
    return isBoolExp(exp) ? exp :
    isNumExp(exp) ? exp :
    isStrExp(exp) ? exp :
    isLitExp(exp) ?exp :
    isVarRef(exp) ? exp :
    isProcExp(exp) ? makeProcExp(exp.args,map(L31ToL3_cexp,exp.body)):
    isIfExp(exp) ? makeIfExp(L31ToL3_cexp(exp.test),L31ToL3_cexp(exp.then),L31ToL3_cexp(exp.alt)) :
    isAppExp(exp) ? makeAppExp(L31ToL3_cexp(exp.rator),map(L31ToL3_cexp,exp.rands)) :
    isPrimOp(exp) ? exp :
    isLetExp(exp) ? L31ToL3_let(exp) :
    isClassExp(exp)? rewriteClass(exp):
    exp
}

const L31ToL3_let = (exp: LetExp ): LetExp =>{
    const vars = map((b=>b.var.var),exp.bindings);
    const vals = map(L31ToL3_cexp,map((b=>b.val),exp.bindings));
    const bodies = map(L31ToL3_cexp,exp.body);
    const bindings = (zipWith(makeBinding, vars, vals));
    return makeLetExp(bindings,bodies);
}


// isDefineExp(exp) ? `(define ${exp.var.var} ${unparseL31(exp.val)})` :
// isProgram(exp) ? `(L31 ${unparseLExps(exp.exps)})` :



// const rewriteIf = (exp: IfExp): CondExp =>
//     makeCondExp([
//         makeCondClause(exp.test, [exp.then]),
//         makeCondClause(makeBoolExp(true), [exp.alt])
//     ]);

// const parseLetExp = (bindings: Sexp, body: Sexp[]): Result<LetExp> => {
//     if (!isGoodBindings(bindings)) {
//         return makeFailure('Malformed bindings in "let" expression');
//     }
//     const vars = map(b => b[0], bindings);
//     const valsResult = mapResult(binding => parseL31CExp(second(binding)), bindings);
//     const bindingsResult = bind(valsResult, (vals: CExp[]) => makeOk(zipWith(makeBinding, vars, vals)));
//     return safe2((bindings: Binding[], body: CExp[]) => makeOk(makeLetExp(bindings, body)))
//         (bindingsResult, mapResult(parseL31CExp, body));
// }