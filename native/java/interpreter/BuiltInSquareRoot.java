import java.util.ArrayList;

public class BuiltInSquareRoot extends FunctionNode {

	public BuiltInSquareRoot(String functionName, ArrayList<VariableNode> parameterCollection,
			ArrayList<VariableNode> variableCollection, ArrayList<StatementNode> statements) {
		super(functionName, parameterCollection, variableCollection, statements);
	}

	public void execute(ArrayList<InterpreterDataType> dataCollection) {
		//System.in.read(dataCollection); not sure what to do here due to there being no simple read method in java
	}

}