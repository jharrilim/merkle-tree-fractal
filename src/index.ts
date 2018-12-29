import { MerkleTree } from '@jharrilim/merkletree-js';


export class FractalTree {
    private static merkleTreeLimit = 1 << 3;

    private merkleTree: MerkleTree;
    private childTrees: FractalTree[];
    private childLimit: number;
    private treeState: AsyncIterableIterator<void>;
    private data: any;


    public constructor(maxChildren: number) {
        this.merkleTree = MerkleTree.create();
        this.childTrees = [];
        this.childLimit = maxChildren;
        this.treeState = this._addNode();
    }

    public async addNode(data: any) {
        this.data = data;
        await this.treeState.next();
    }

    private async *_addNode(): AsyncIterableIterator<void> {
        while (this.merkleTree.length < FractalTree.merkleTreeLimit) {
            yield void await this.merkleTree.addNode(this.data);
        }

        if (this.childLimit === 0) {
            return;
        }

        while (true) {
            for (let i = 0; i < this.childLimit; ++i) {
                this.childTrees[i] = new FractalTree(this.childLimit >> 1);
                yield* await this.childTrees[i]._addNode();
            }
            this.childLimit <<= 1;
        }
    }
}