import {N, F, C, SingleParser, Option, Tuple, Streams} from "@masala/parser";
import { TreeNode } from "./types";

function subExprGenerator() {

    const nextItem = C.char(",").drop().then(F.lazy(atomGenerator))
    return nextItem.optrep();
}

function atomGenerator() {
    return F.try(N.number())
    .or(F.lazy(treeNodeParserGenerator))
}

function listGenerator() {
    const listExpr = atomGenerator()
        .then(F.lazy(subExprGenerator))
    return listExpr.opt()
}

/*
Grammar
T = "["L?"]"
L = AR*
R =","A
A = <num> | T
*/
export function treeNodeParserGenerator(): SingleParser<TreeNode> {
    const listParser = C.char("[").drop()
        .then(F.lazy(listGenerator))
        .then(C.char("]").drop())
        .array()
        .map((items) => {
            return items.filter(i => i.isPresent())
                .flatMap(i => {
                    const val = i.get();
                    const values = val.array();
                    const trueValues = values.map(x => {
                        if ((x as Option<Tuple<number | TreeNode>>).isPresent === undefined) {
                            return x;
                        } else {
                            const opt = x as Option<Tuple<number | TreeNode>>
                            if (opt.isPresent()) {
                                return opt.get().first();
                            } else {
                                return undefined;
                            }
                        }
                    }).filter(x => x != null);
                    return trueValues as TreeNode[];
                })
        });
    
        return listParser;
}

export function parseNode(line: string): TreeNode | null {
    const response = treeNodeParserGenerator().eos().parse(Streams.ofString(line));
    if (response.isAccepted()) {
        return response.value;
    }
    return null;
}
