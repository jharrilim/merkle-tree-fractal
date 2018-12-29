import { MerkleTree } from '@jharrilim/merkletree-js';


export class FractalTree {
    private static merkleTreeLimit = 1 << 3;

    private merkleTree: MerkleTree;
    private childTrees: FractalTree[];
    private childLimit: number;
    private treeState: AsyncIterableIterator<void>;
    private data: any;

    private constructor(maxChildren: number) {
        this.merkleTree = MerkleTree.create();
        this.childTrees = [];
        this.childLimit = maxChildren < 2 ? 2 : maxChildren;
        this.treeState = this._addNode();
    }

    public static create() {
        return new FractalTree(2);
    }

    public async addNode(data: any): Promise<void> {
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
            for (let i = this.childLimit >> 1; i < this.childLimit; ++i) {
                this.childTrees[i] = new FractalTree(this.childLimit >> 1);
                yield* await this.childTrees[i]._addNode();
            }
            this.childLimit <<= 1;
        }
    }
}